// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2025 Alaa-eddine KADDOURI

import * as walk from 'acorn-walk';
import ScopeManager from '../analysis/ScopeManager';
import { ASTFactory, CONTEXT_NAME } from '../utils/ASTFactory';
import {
    transformIdentifier,
    transformCallExpression,
    transformMemberExpression,
    transformArrayIndex,
    addArrayAccess,
} from './ExpressionTransformer';

export function transformAssignmentExpression(node: any, scopeManager: ScopeManager): void {
    let targetVarRef = null;
    // Transform assignment expressions to use the context object
    if (node.left.type === 'Identifier') {
        const [varName, kind] = scopeManager.getVariable(node.left.name);
        targetVarRef = ASTFactory.createContextVariableReference(kind, varName);
    } else if (node.left.type === 'MemberExpression' && node.left.computed) {
        // Assignment to array element: series[0] = val
        if (node.left.object.type === 'Identifier') {
            const name = node.left.object.name;
            const [varName, kind] = scopeManager.getVariable(name);
            const isRenamed = varName !== name;
            const isContextBound = scopeManager.isContextBound(name);

            if ((isRenamed || isContextBound) && !scopeManager.isLoopVariable(name)) {
                // If index is 0 (literal), transform to $.set(target, value)
                if (node.left.property.type === 'Literal' && node.left.property.value === 0) {
                    targetVarRef = ASTFactory.createContextVariableReference(kind, varName);
                }
            }
        }
    }

    // Transform identifiers in the right side of the assignment
    walk.recursive(
        node.right,
        { parent: node.right, inNamespaceCall: false },
        {
            Identifier(node: any, state: any, c: any) {
                //special case for na
                if (node.name == 'na') {
                    node.name = 'NaN';
                }
                node.parent = state.parent;
                transformIdentifier(node, scopeManager);
                const isBinaryOperation = node.parent && node.parent.type === 'BinaryExpression';
                const isConditional = node.parent && node.parent.type === 'ConditionalExpression';
                const isContextBound = scopeManager.isContextBound(node.name) && !scopeManager.isRootParam(node.name);
                const hasArrayAccess = node.parent && node.parent.type === 'MemberExpression' && node.parent.computed && node.parent.object === node;
                const isParamCall = node.parent && node.parent._isParamCall;
                const isMemberExpression = node.parent && node.parent.type === 'MemberExpression';
                const isReserved = node.name === 'NaN';
                const isGetCall =
                    node.parent &&
                    node.parent.type === 'CallExpression' &&
                    node.parent.callee &&
                    node.parent.callee.object &&
                    node.parent.callee.object.name === CONTEXT_NAME &&
                    node.parent.callee.property.name === 'get';

                if (isContextBound || isConditional || isBinaryOperation) {
                    if (node.type === 'MemberExpression') {
                        transformArrayIndex(node, scopeManager);
                    } else if (node.type === 'Identifier' && !isMemberExpression && !hasArrayAccess && !isParamCall && !isReserved && !isGetCall) {
                        addArrayAccess(node, scopeManager);
                    }
                }
            },
            MemberExpression(node: any, state: any, c: any) {
                transformMemberExpression(node, '', scopeManager);
                // Then continue with object transformation or arguments if transformed to CallExpression
                if (node.type === 'CallExpression') {
                    node.arguments.forEach((arg: any) => c(arg, { parent: node, inNamespaceCall: state.inNamespaceCall }));
                } else if (node.object) {
                    c(node.object, { parent: node, inNamespaceCall: state.inNamespaceCall });
                }
            },
            CallExpression(node: any, state: any, c: any) {
                const isNamespaceCall =
                    node.callee &&
                    node.callee.type === 'MemberExpression' &&
                    node.callee.object &&
                    node.callee.object.type === 'Identifier' &&
                    scopeManager.isContextBound(node.callee.object.name);

                // First transform the call expression itself
                transformCallExpression(node, scopeManager);

                // Then transform its arguments with the correct context
                node.arguments.forEach((arg: any) => c(arg, { parent: node, inNamespaceCall: isNamespaceCall || state.inNamespaceCall }));
            },
        }
    );

    if (targetVarRef) {
        let rightSide = node.right;

        // Handle compound assignment operators (+=, -=, *=, etc.)
        if (node.operator !== '=') {
            const operator = node.operator.replace('=', '');

            // Create a read access for the target variable: $.get(targetVarRef, 0)
            const readAccess = ASTFactory.createGetCall(targetVarRef, 0);

            // Create a binary expression: readAccess [op] node.right
            // Example: a += 10  ->  $.set(a, $.get(a, 0) + 10)
            rightSide = {
                type: 'BinaryExpression',
                operator: operator,
                left: readAccess,
                right: node.right,
                start: node.start,
                end: node.end,
            };
        }

        // Replace the whole assignment expression with $.set(targetVarRef, rightSide)
        const setCall = ASTFactory.createSetCall(targetVarRef, rightSide);

        // Preserve location
        if (node.start) setCall.start = node.start;
        if (node.end) setCall.end = node.end;

        Object.assign(node, setCall);
    }
}

export function transformVariableDeclaration(varNode: any, scopeManager: ScopeManager): void {
    varNode.declarations.forEach((decl: any) => {
        //special case for na
        if (decl.init.name == 'na') {
            decl.init.name = 'NaN';
        }

        // Check if this is a context property assignment

        // prettier-ignore
        const isContextProperty =
            decl.init &&
            decl.init.type === 'MemberExpression' &&
            decl.init.object &&            
                (decl.init.object.name === 'context' || 
                    decl.init.object.name === CONTEXT_NAME || 
                    decl.init.object.name === 'context2')

        // prettier-ignore
        const isSubContextProperty =
            decl.init &&
            decl.init.type === 'MemberExpression' &&
            decl.init.object?.object &&
            (decl.init.object.object.name === 'context' ||
                decl.init.object.object.name === CONTEXT_NAME ||
                decl.init.object.object.name === 'context2');

        // Check if this is an arrow function declaration
        const isArrowFunction = decl.init && decl.init.type === 'ArrowFunctionExpression';

        if (isContextProperty) {
            // For context properties, register as context-bound and update the object name
            if (decl.id.name) {
                scopeManager.addContextBoundVar(decl.id.name);
            }
            if (decl.id.properties) {
                decl.id.properties.forEach((property: any) => {
                    if (property.key.name) {
                        scopeManager.addContextBoundVar(property.key.name);
                    }
                });
            }
            decl.init.object.name = CONTEXT_NAME;
            return;
        }

        if (isSubContextProperty) {
            // For context properties, register as context-bound and update the object name
            if (decl.id.name) {
                scopeManager.addContextBoundVar(decl.id.name);
            }
            if (decl.id.properties) {
                decl.id.properties.forEach((property: any) => {
                    if (property.key.name) {
                        scopeManager.addContextBoundVar(property.key.name);
                    }
                });
            }
            decl.init.object.object.name = CONTEXT_NAME;
            return;
        }

        if (isArrowFunction) {
            // Register arrow function parameters as context-bound
            decl.init.params.forEach((param: any) => {
                if (param.type === 'Identifier') {
                    scopeManager.addContextBoundVar(param.name);
                }
            });
        }

        // Transform non-context variables to use the context object
        const newName = scopeManager.addVariable(decl.id.name, varNode.kind);
        const kind = varNode.kind; // 'const', 'let', or 'var'

        // Transform identifiers in the init expression
        if (decl.init && !isArrowFunction) {
            // Check if initialization is a namespace function call
            if (
                decl.init.type === 'CallExpression' &&
                decl.init.callee.type === 'MemberExpression' &&
                decl.init.callee.object &&
                decl.init.callee.object.type === 'Identifier' &&
                scopeManager.isContextBound(decl.init.callee.object.name)
            ) {
                // Transform the function call arguments
                transformCallExpression(decl.init, scopeManager);
            } else {
                // Add parent references for proper function call detection
                walk.recursive(
                    decl.init,
                    { parent: decl.init },
                    {
                        Identifier(node: any, state: any) {
                            node.parent = state.parent;
                            transformIdentifier(node, scopeManager);

                            const isBinaryOperation = node.parent && node.parent.type === 'BinaryExpression';
                            const isConditional = node.parent && node.parent.type === 'ConditionalExpression';
                            const isGetCall =
                                node.parent &&
                                node.parent.type === 'CallExpression' &&
                                node.parent.callee &&
                                node.parent.callee.object &&
                                node.parent.callee.object.name === CONTEXT_NAME &&
                                node.parent.callee.property.name === 'get';

                            if (node.type === 'Identifier' && (isBinaryOperation || isConditional) && !isGetCall) {
                                addArrayAccess(node, scopeManager);
                            }
                        },
                        CallExpression(node: any, state: any, c: any) {
                            // Set parent for the function name
                            if (node.callee.type === 'Identifier') {
                                node.callee.parent = node;
                            }
                            // Set parent for arguments
                            node.arguments.forEach((arg: any) => {
                                if (arg.type === 'Identifier') {
                                    arg.parent = node;
                                }
                            });
                            transformCallExpression(node, scopeManager);
                            // Continue walking the arguments
                            node.arguments.forEach((arg) => c(arg, { parent: node }));
                        },
                        BinaryExpression(node: any, state: any, c: any) {
                            // Set parent references for operands
                            if (node.left.type === 'Identifier') {
                                node.left.parent = node;
                            }
                            if (node.right.type === 'Identifier') {
                                node.right.parent = node;
                            }
                            // Transform both operands
                            c(node.left, { parent: node });
                            c(node.right, { parent: node });
                        },
                        MemberExpression(node: any, state: any, c: any) {
                            // Set parent reference
                            if (node.object && node.object.type === 'Identifier') {
                                node.object.parent = node;
                            }
                            if (node.property && node.property.type === 'Identifier') {
                                node.property.parent = node;
                            }
                            // Transform array indices first
                            transformMemberExpression(node, '', scopeManager);
                            // Then continue with object transformation
                            if (node.type === 'CallExpression') {
                                node.arguments.forEach((arg: any) => c(arg, { parent: node }));
                            } else if (node.object) {
                                c(node.object, { parent: node });
                            }
                        },
                    }
                );
            }
        }

        // Create the target variable reference using ASTFactory
        const targetVarRef = ASTFactory.createContextVariableReference(kind, newName);

        const isArrayPatternVar = scopeManager.isArrayPatternElement(decl.id.name);
        // Check if initialization is from array access
        const isArrayInit =
            !isArrayPatternVar &&
            decl.init &&
            decl.init.type === 'MemberExpression' &&
            decl.init.computed &&
            decl.init.property &&
            (decl.init.property.type === 'Literal' || decl.init.property.type === 'MemberExpression');

        if (decl.init?.property?.type === 'MemberExpression') {
            if (!decl.init.property._indexTransformed) {
                transformArrayIndex(decl.init.property, scopeManager);
                decl.init.property._indexTransformed = true;
            }
        }

        // Prepare right side
        let rightSide;
        if (decl.init) {
            if (isArrowFunction || isArrayPatternVar) {
                rightSide = decl.init;
            } else {
                rightSide = ASTFactory.createInitCall(
                    targetVarRef,
                    isArrayInit ? decl.init.object : decl.init,
                    isArrayInit ? decl.init.property : undefined
                );
            }
        } else {
            rightSide = ASTFactory.createIdentifier('undefined');
        }

        // Create assignment
        const assignmentExpr = ASTFactory.createExpressionStatement(ASTFactory.createAssignmentExpression(targetVarRef, rightSide));

        if (isArrayPatternVar) {
            // Complex logic for array pattern, keeping as is but using ASTFactory where obvious
            assignmentExpr.expression.right.object.property.name += `?.[0][${decl.init.property.value}]`;
            const obj = assignmentExpr.expression.right.object;

            // Reconstruct the init call
            assignmentExpr.expression.right = ASTFactory.createCallExpression(
                ASTFactory.createMemberExpression(ASTFactory.createContextIdentifier(), ASTFactory.createIdentifier('init')),
                [targetVarRef, obj]
            );
        }

        if (isArrowFunction) {
            // Transform the body of arrow functions
            scopeManager.pushScope('fn');
            walk.recursive(decl.init.body, scopeManager, {
                BlockStatement(node: any, state: ScopeManager, c: any) {
                    //state.pushScope('block');
                    node.body.forEach((stmt: any) => c(stmt, state));
                    //state.popScope();
                },
                IfStatement(node: any, state: ScopeManager, c: any) {
                    state.pushScope('if');
                    c(node.consequent, state);
                    if (node.alternate) {
                        state.pushScope('els');
                        c(node.alternate, state);
                        state.popScope();
                    }
                    state.popScope();
                },
                VariableDeclaration(node: any, state: ScopeManager) {
                    transformVariableDeclaration(node, state);
                },
                Identifier(node: any, state: ScopeManager) {
                    transformIdentifier(node, state);
                },
                AssignmentExpression(node: any, state: ScopeManager) {
                    transformAssignmentExpression(node, state);
                },
            });
            scopeManager.popScope();
        }

        // Replace the original node with the transformed assignment
        Object.assign(varNode, assignmentExpr);
    });
}

export function transformForStatement(node: any, scopeManager: ScopeManager, c: any): void {
    // Handle initialization
    if (node.init && node.init.type === 'VariableDeclaration') {
        // Keep the original loop variable name
        const decl = node.init.declarations[0];
        const originalName = decl.id.name;
        scopeManager.addLoopVariable(originalName, originalName);

        // Keep the original variable declaration
        node.init = {
            type: 'VariableDeclaration',
            kind: node.init.kind,
            declarations: [
                {
                    type: 'VariableDeclarator',
                    id: {
                        type: 'Identifier',
                        name: originalName,
                    },
                    init: decl.init,
                },
            ],
        };

        // Transform any identifiers in the init expression
        if (decl.init) {
            walk.recursive(decl.init, scopeManager, {
                Identifier(node: any, state: ScopeManager) {
                    if (!scopeManager.isLoopVariable(node.name)) {
                        scopeManager.pushScope('for');
                        transformIdentifier(node, state);
                        scopeManager.popScope();
                    }
                },
                MemberExpression(node: any) {
                    scopeManager.pushScope('for');
                    transformMemberExpression(node, '', scopeManager);
                    scopeManager.popScope();
                },
            });
        }
    }

    // Transform test condition
    if (node.test) {
        walk.recursive(node.test, scopeManager, {
            Identifier(node: any, state: ScopeManager) {
                if (!scopeManager.isLoopVariable(node.name) && !node.computed) {
                    scopeManager.pushScope('for');
                    transformIdentifier(node, state);
                    if (node.type === 'Identifier') {
                        node.computed = true;
                        addArrayAccess(node, state);
                    }
                    scopeManager.popScope();
                }
            },
            MemberExpression(node: any) {
                scopeManager.pushScope('for');
                transformMemberExpression(node, '', scopeManager);
                scopeManager.popScope();
            },
        });
    }

    // Transform update expression
    if (node.update) {
        walk.recursive(node.update, scopeManager, {
            Identifier(node: any, state: ScopeManager) {
                if (!scopeManager.isLoopVariable(node.name)) {
                    scopeManager.pushScope('for');
                    transformIdentifier(node, state);
                    scopeManager.popScope();
                }
            },
        });
    }

    // Transform the loop body
    scopeManager.pushScope('for');
    c(node.body, scopeManager);
    scopeManager.popScope();
}

export function transformWhileStatement(node: any, scopeManager: ScopeManager, c: any): void {
    // Transform the test condition of the while loop
    walk.simple(node.test, {
        Identifier(idNode: any) {
            transformIdentifier(idNode, scopeManager);
        },
    });

    // Process the body of the while loop
    scopeManager.pushScope('whl');
    c(node.body, scopeManager);
    scopeManager.popScope();
}

export function transformExpression(node: any, scopeManager: ScopeManager): void {
    walk.recursive(node, scopeManager, {
        MemberExpression(node: any) {
            transformMemberExpression(node, '', scopeManager);
        },

        CallExpression(node: any, state: ScopeManager) {
            transformCallExpression(node, state);
        },
        Identifier(node: any, state: ScopeManager) {
            transformIdentifier(node, state);

            //context bound variable was not transformed, but we still need to ensure array annotation
            const isIfStatement = scopeManager.getCurrentScopeType() === 'if';
            const isContextBound = scopeManager.isContextBound(node.name) && !scopeManager.isRootParam(node.name);
            if (isContextBound && isIfStatement) {
                addArrayAccess(node, state);
            }
        },
    });
}

export function transformIfStatement(node: any, scopeManager: ScopeManager, c: any): void {
    // Transform the test condition
    if (node.test) {
        scopeManager.pushScope('if');
        transformExpression(node.test, scopeManager);
        scopeManager.popScope();
    }

    // Transform the if branch (consequent)
    scopeManager.pushScope('if');
    c(node.consequent, scopeManager);
    scopeManager.popScope();

    // Transform the else branch (alternate) if it exists
    if (node.alternate) {
        scopeManager.pushScope('els');
        c(node.alternate, scopeManager);
        scopeManager.popScope();
    }
}

export function transformReturnStatement(node: any, scopeManager: ScopeManager): void {
    const curScope = scopeManager.getCurrentScopeType();
    // Transform the return argument if it exists
    if (node.argument) {
        if (node.argument.type === 'ArrayExpression') {
            // Transform each element in the array
            node.argument.elements = node.argument.elements.map((element: any) => {
                if (element.type === 'Identifier') {
                    // Skip transformation if it's a context-bound variable
                    if (scopeManager.isContextBound(element.name) && !scopeManager.isRootParam(element.name)) {
                        // Only add [0] if it's not already an array access
                        return ASTFactory.createArrayAccess(element, 0);
                    }

                    // Transform non-context-bound variables
                    const [scopedName, kind] = scopeManager.getVariable(element.name);
                    return ASTFactory.createContextVariableAccess0(kind, scopedName);
                } else if (element.type === 'MemberExpression') {
                    // If it's already a member expression (array access), leave it as is
                    if (
                        element.computed &&
                        element.object.type === 'Identifier' &&
                        scopeManager.isContextBound(element.object.name) &&
                        !scopeManager.isRootParam(element.object.name)
                    ) {
                        return element;
                    }
                    // Otherwise, transform it normally
                    transformMemberExpression(element, '', scopeManager);
                    return element;
                }
                return element;
            });

            node.argument = {
                type: 'ArrayExpression',
                elements: [node.argument],
            };
        } else if (node.argument.type === 'BinaryExpression') {
            // Transform both operands of the binary expression
            walk.recursive(node.argument, scopeManager, {
                Identifier(node: any, state: ScopeManager) {
                    transformIdentifier(node, state);
                    if (node.type === 'Identifier') {
                        addArrayAccess(node, state);
                    }
                },
                MemberExpression(node: any) {
                    transformMemberExpression(node, '', scopeManager);
                },
            });
        } else if (node.argument.type === 'ObjectExpression') {
            // Handle object expressions (existing code)
            node.argument.properties = node.argument.properties.map((prop: any) => {
                // Check for shorthand properties
                if (prop.shorthand) {
                    // Get the variable name and kind
                    const [scopedName, kind] = scopeManager.getVariable(prop.value.name);

                    // Convert shorthand to full property definition
                    return {
                        type: 'Property',
                        key: ASTFactory.createIdentifier(prop.key.name),
                        value: ASTFactory.createContextVariableReference(kind, scopedName),
                        kind: 'init',
                        method: false,
                        shorthand: false,
                        computed: false,
                    };
                }
                return prop;
            });
        } else if (node.argument.type === 'Identifier') {
            transformIdentifier(node.argument, scopeManager);
            if (node.argument.type === 'Identifier') {
                addArrayAccess(node.argument, scopeManager);
            }
        }

        if (curScope === 'fn') {
            //for nested functions : wrap the return argument in a CallExpression with math._precision(<statement>)
            // Process different types of return arguments
            if (
                node.argument.type === 'Identifier' &&
                scopeManager.isContextBound(node.argument.name) &&
                !scopeManager.isRootParam(node.argument.name)
            ) {
                // For context-bound identifiers, add [0] array access if not already an array access
                node.argument = ASTFactory.createArrayAccess(node.argument, 0);
            } else if (node.argument.type === 'MemberExpression') {
                // For member expressions, check if the object is context-bound
                if (
                    node.argument.object.type === 'Identifier' &&
                    scopeManager.isContextBound(node.argument.object.name) &&
                    !scopeManager.isRootParam(node.argument.object.name)
                ) {
                    // Transform array indices first if not already transformed
                    if (!node.argument._indexTransformed) {
                        transformArrayIndex(node.argument, scopeManager);
                        node.argument._indexTransformed = true;
                    }
                }
            } else if (
                node.argument.type === 'BinaryExpression' ||
                node.argument.type === 'LogicalExpression' ||
                node.argument.type === 'ConditionalExpression' ||
                node.argument.type === 'CallExpression'
            ) {
                // For complex expressions, walk the AST and transform all identifiers and expressions
                walk.recursive(node.argument, scopeManager, {
                    Identifier(node: any, state: ScopeManager) {
                        transformIdentifier(node, state);
                        // Add array access if needed
                        if (node.type === 'Identifier' && !node._arrayAccessed) {
                            addArrayAccess(node, state);
                            node._arrayAccessed = true;
                        }
                    },
                    MemberExpression(node: any) {
                        transformMemberExpression(node, '', scopeManager);
                    },
                    CallExpression(node: any, state: ScopeManager) {
                        transformCallExpression(node, state);
                    },
                });
            }

            const precisionCall = ASTFactory.createCallExpression(
                ASTFactory.createMemberExpression(ASTFactory.createContextIdentifier(), ASTFactory.createIdentifier('precision')),
                [node.argument]
            );
            node.argument = precisionCall;
        }
    }
}

export function transformFunctionDeclaration(node: any, scopeManager: ScopeManager, c: any): void {
    // Note: We don't register parameters here anymore, that's done in the AnalysisPass.

    // Transform the function body
    if (node.body && node.body.type === 'BlockStatement') {
        scopeManager.pushScope('fn');
        // Just delegate to the callback to continue the recursion
        c(node.body, scopeManager);
        scopeManager.popScope();
    }
}
