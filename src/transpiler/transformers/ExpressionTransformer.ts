// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2025 Alaa-eddine KADDOURI

import * as walk from 'acorn-walk';
import ScopeManager from '../analysis/ScopeManager';
import { ASTFactory, CONTEXT_NAME } from '../utils/ASTFactory';

const UNDEFINED_ARG = {
    type: 'Identifier',
    name: 'undefined',
};

export function transformArrayIndex(node: any, scopeManager: ScopeManager): void {
    if (node.computed && node.property.type === 'Identifier') {
        // Skip transformation if it's a loop variable
        if (scopeManager.isLoopVariable(node.property.name)) {
            return;
        }

        // Only transform if it's not a context-bound variable
        if (!scopeManager.isContextBound(node.property.name)) {
            const [scopedName, kind] = scopeManager.getVariable(node.property.name);

            // Transform property to $.kind.scopedName
            node.property = ASTFactory.createContextVariableReference(kind, scopedName);

            // Add [length - 1] to the index: $.kind.scopedName[$.kind.scopedName.length - 1]
            node.property = ASTFactory.createLastElementAccess(node.property);
        }
    }

    if (node.computed && node.object.type === 'Identifier') {
        if (scopeManager.isLoopVariable(node.object.name)) {
            return;
        }

        if (!scopeManager.isContextBound(node.object.name)) {
            const [scopedName, kind] = scopeManager.getVariable(node.object.name);

            // Transform the object to scoped variable: $.kind.scopedName
            node.object = ASTFactory.createContextVariableReference(kind, scopedName);
        }

        if (node.property.type === 'MemberExpression') {
            const memberNode = node.property;
            if (!memberNode._indexTransformed) {
                transformArrayIndex(memberNode, scopeManager);
                memberNode._indexTransformed = true;
            }
        }
    }
}

export function addArrayAccess(node: any, scopeManager: ScopeManager): void {
    const memberExpr = ASTFactory.createLastElementAccess(ASTFactory.createIdentifier(node.name));
    // Preserve location info if available
    if (node.start !== undefined) memberExpr.object.start = node.start;
    if (node.end !== undefined) memberExpr.object.end = node.end;

    memberExpr._indexTransformed = true;
    Object.assign(node, memberExpr);
}

export function transformIdentifier(node: any, scopeManager: ScopeManager): void {
    // Transform identifiers to use the context object
    if (node.name !== CONTEXT_NAME) {
        // Skip transformation for global and native objects
        if (
            node.name === 'Math' ||
            node.name === 'NaN' ||
            node.name === 'undefined' ||
            node.name === 'Infinity' ||
            node.name === 'null' ||
            (node.name.startsWith("'") && node.name.endsWith("'")) ||
            (node.name.startsWith('"') && node.name.endsWith('"')) ||
            (node.name.startsWith('`') && node.name.endsWith('`'))
        ) {
            return;
        }

        // Skip transformation for loop variables
        if (scopeManager.isLoopVariable(node.name)) {
            return;
        }

        // If it's a nested function parameter (but not a root parameter), skip transformation
        if (scopeManager.isContextBound(node.name) && !scopeManager.isRootParam(node.name)) {
            return;
        }

        // Check if this identifier is part of a namespace member access (e.g., ta.ema)
        const isNamespaceMember =
            node.parent && node.parent.type === 'MemberExpression' && node.parent.object === node && scopeManager.isContextBound(node.name);

        // Check if this identifier is part of a param() call
        const isParamCall =
            node.parent &&
            node.parent.type === 'CallExpression' &&
            node.parent.callee &&
            node.parent.callee.type === 'MemberExpression' &&
            node.parent.callee.property.name === 'param';

        const isInit = node.parent && node.parent.type === 'AssignmentExpression' && node.parent.left === node;
        // Check if this identifier is an argument to a namespace function
        const isNamespaceFunctionArg =
            node.parent &&
            node.parent.type === 'CallExpression' &&
            node.parent.callee &&
            node.parent.callee.type === 'MemberExpression' &&
            scopeManager.isContextBound(node.parent.callee.object.name);

        // Check if this identifier is part of an array access
        const isArrayAccess = node.parent && node.parent.type === 'MemberExpression' && node.parent.computed;

        // Check if this identifier is part of an array access that's an argument to a namespace function
        const isArrayIndexInNamespaceCall =
            node.parent &&
            node.parent.type === 'MemberExpression' &&
            node.parent.computed &&
            node.parent.property === node &&
            node.parent.parent &&
            node.parent.parent.type === 'CallExpression' &&
            node.parent.parent.callee &&
            node.parent.parent.callee.type === 'MemberExpression' &&
            scopeManager.isContextBound(node.parent.parent.callee.object.name);

        // Check if this identifier is a function being called
        const isFunctionCall = node.parent && node.parent.type === 'CallExpression' && node.parent.callee === node;

        if (isNamespaceMember || isParamCall || isNamespaceFunctionArg || isArrayIndexInNamespaceCall || isFunctionCall) {
            // For function calls, we should just use the original name without scoping
            if (isFunctionCall) {
                return;
            }
            // Don't add [0] for namespace function arguments or array indices
            const [scopedName, kind] = scopeManager.getVariable(node.name);
            const memberExpr = ASTFactory.createContextVariableReference(kind, scopedName);
            Object.assign(node, memberExpr);
            return;
        }

        const [scopedName, kind] = scopeManager.getVariable(node.name);
        const memberExpr = ASTFactory.createContextVariableReference(kind, scopedName);

        // Check if parent node is already a member expression with computed property (array access)
        const hasArrayAccess = node.parent && node.parent.type === 'MemberExpression' && node.parent.computed && node.parent.object === node;

        if (!hasArrayAccess && !isArrayAccess) {
            // Add [length - 1] array access if not already present and not part of array access
            const accessExpr = ASTFactory.createLastElementAccess(memberExpr);
            Object.assign(node, accessExpr);
        } else {
            // Just replace with the member expression without adding array access
            Object.assign(node, memberExpr);
        }
    }
}

export function transformMemberExpression(memberNode: any, originalParamName: string, scopeManager: ScopeManager): void {
    // Skip transformation for Math object properties
    if (memberNode.object && memberNode.object.type === 'Identifier' && memberNode.object.name === 'Math') {
        return;
    }

    //if statment variables always need to be transformed
    const isIfStatement = scopeManager.getCurrentScopeType() == 'if';
    const isElseStatement = scopeManager.getCurrentScopeType() == 'els';
    const isForStatement = scopeManager.getCurrentScopeType() == 'for';
    // If the object is a context-bound variable (like a function parameter), skip transformation
    if (
        !isIfStatement &&
        !isElseStatement &&
        !isForStatement &&
        memberNode.object &&
        memberNode.object.type === 'Identifier' &&
        scopeManager.isContextBound(memberNode.object.name) &&
        !scopeManager.isRootParam(memberNode.object.name)
    ) {
        return;
    }

    // Transform array indices
    if (!memberNode._indexTransformed) {
        transformArrayIndex(memberNode, scopeManager);
        memberNode._indexTransformed = true;
    }
}

// Helper for transformFunctionArgument
function transformIdentifierForParam(node: any, scopeManager: ScopeManager): any {
    if (node.type === 'Identifier') {
        if (node.name === 'na') {
            node.name = 'NaN';
            return node;
        }

        // Skip transformation for loop variables
        if (scopeManager.isLoopVariable(node.name)) {
            return node;
        }
        // If it's a root parameter, transform it with $.let prefix
        if (scopeManager.isRootParam(node.name)) {
            const [scopedName, kind] = scopeManager.getVariable(node.name);
            return ASTFactory.createContextVariableReference(kind, scopedName);
        }
        // If it's a nested function parameter or other context-bound variable, return as is
        if (scopeManager.isContextBound(node.name)) {
            return node;
        }
        // Otherwise transform with $.let prefix
        const [scopedName, kind] = scopeManager.getVariable(node.name);
        return ASTFactory.createContextVariableReference(kind, scopedName);
    }
    return node;
}

function transformOperand(node: any, scopeManager: ScopeManager, namespace: string = ''): any {
    switch (node.type) {
        case 'BinaryExpression': {
            return getParamFromBinaryExpression(node, scopeManager, namespace);
        }
        case 'MemberExpression': {
            // Handle array access
            const transformedObject = node.object.type === 'Identifier' ? transformIdentifierForParam(node.object, scopeManager) : node.object;
            // Don't add [0] if this is already an array access
            return {
                type: 'MemberExpression',
                object: transformedObject,
                property: node.property,
                computed: node.computed,
            };
        }
        case 'Identifier': {
            // Skip transformation for loop variables
            if (scopeManager.isLoopVariable(node.name)) {
                return node;
            }
            // Check if this identifier is part of a member expression (array access)
            const isMemberExprProperty = node.parent && node.parent.type === 'MemberExpression' && node.parent.property === node;
            if (isMemberExprProperty) {
                return node;
            }
            const transformedObject = transformIdentifierForParam(node, scopeManager);

            return ASTFactory.createLastElementAccess(transformedObject);
        }
        case 'UnaryExpression': {
            return getParamFromUnaryExpression(node, scopeManager, namespace);
        }
    }

    return node;
}

function getParamFromBinaryExpression(node: any, scopeManager: ScopeManager, namespace: string): any {
    // Transform both operands
    const transformedLeft = transformOperand(node.left, scopeManager, namespace);
    const transformedRight = transformOperand(node.right, scopeManager, namespace);

    // Create the binary expression
    const binaryExpr = {
        type: 'BinaryExpression',
        operator: node.operator,
        left: transformedLeft,
        right: transformedRight,
        start: node.start,
        end: node.end,
    };

    // Walk through the binary expression to transform any function calls
    walk.recursive(binaryExpr, scopeManager, {
        CallExpression(node: any, scopeManager: ScopeManager) {
            if (!node._transformed) {
                transformCallExpression(node, scopeManager);
            }
        },
        MemberExpression(node: any) {
            transformMemberExpression(node, '', scopeManager);
        },
    });

    return binaryExpr;
}

function getParamFromLogicalExpression(node: any, scopeManager: ScopeManager, namespace: string): any {
    // Transform both operands
    const transformedLeft = transformOperand(node.left, scopeManager, namespace);
    const transformedRight = transformOperand(node.right, scopeManager, namespace);

    const logicalExpr = {
        type: 'LogicalExpression',
        operator: node.operator,
        left: transformedLeft,
        right: transformedRight,
        start: node.start,
        end: node.end,
    };

    // Walk through the logical expression to transform any function calls
    walk.recursive(logicalExpr, scopeManager, {
        CallExpression(node: any, scopeManager: ScopeManager) {
            if (!node._transformed) {
                transformCallExpression(node, scopeManager);
            }
        },
    });

    return logicalExpr;
}

function getParamFromConditionalExpression(node: any, scopeManager: ScopeManager, namespace: string): any {
    // Transform identifiers in the right side of the assignment
    walk.recursive(
        node,
        { parent: node, inNamespaceCall: false },
        {
            Identifier(node: any, state: any, c: any) {
                if (node.name == 'NaN') return;
                if (node.name == 'na') {
                    node.name = 'NaN';
                    return;
                }
                node.parent = state.parent;
                transformIdentifier(node, scopeManager);
                const isBinaryOperation = node.parent && node.parent.type === 'BinaryExpression';
                const isConditional = node.parent && node.parent.type === 'ConditionalExpression';

                if (isConditional || isBinaryOperation) {
                    if (node.type === 'MemberExpression') {
                        transformArrayIndex(node, scopeManager);
                    } else if (node.type === 'Identifier') {
                        addArrayAccess(node, scopeManager);
                    }
                }
            },
            MemberExpression(node: any, state: any, c: any) {
                // Transform array indices first
                transformArrayIndex(node, scopeManager);
                // Then continue with object transformation
                if (node.object) {
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

    const memberExpr = ASTFactory.createMemberExpression(ASTFactory.createIdentifier(namespace), ASTFactory.createIdentifier('param'));

    return {
        type: 'CallExpression',
        callee: memberExpr,
        arguments: [node, UNDEFINED_ARG, scopeManager.nextParamIdArg],
        _transformed: true,
        _isParamCall: true,
    };
}

function getParamFromUnaryExpression(node: any, scopeManager: ScopeManager, namespace: string): any {
    // Transform the argument
    const transformedArgument = transformOperand(node.argument, scopeManager, namespace);

    // Create the unary expression
    const unaryExpr = {
        type: 'UnaryExpression',
        operator: node.operator,
        prefix: node.prefix,
        argument: transformedArgument,
        start: node.start,
        end: node.end,
    };

    return unaryExpr;
}

export function transformFunctionArgument(arg: any, namespace: string, scopeManager: ScopeManager): any {
    // Handle binary expressions (arithmetic operations)

    switch (arg?.type) {
        case 'BinaryExpression':
            arg = getParamFromBinaryExpression(arg, scopeManager, namespace);
            break;
        case 'LogicalExpression':
            arg = getParamFromLogicalExpression(arg, scopeManager, namespace);
            break;
        case 'ConditionalExpression':
            return getParamFromConditionalExpression(arg, scopeManager, namespace);
        case 'UnaryExpression':
            arg = getParamFromUnaryExpression(arg, scopeManager, namespace);
            break;
    }

    // Check if the argument is an array access
    const isArrayAccess = arg.type === 'MemberExpression' && arg.computed && arg.property;

    if (isArrayAccess) {
        // Transform array access
        const transformedObject =
            arg.object.type === 'Identifier' && scopeManager.isContextBound(arg.object.name) && !scopeManager.isRootParam(arg.object.name)
                ? arg.object
                : transformIdentifierForParam(arg.object, scopeManager);

        // Transform the index if it's an identifier
        const transformedProperty =
            arg.property.type === 'Identifier' && !scopeManager.isContextBound(arg.property.name) && !scopeManager.isLoopVariable(arg.property.name)
                ? transformIdentifierForParam(arg.property, scopeManager)
                : arg.property;

        const memberExpr = ASTFactory.createMemberExpression(ASTFactory.createIdentifier(namespace), ASTFactory.createIdentifier('param'));

        return {
            type: 'CallExpression',
            callee: memberExpr,
            arguments: [transformedObject, transformedProperty, scopeManager.nextParamIdArg],
            _transformed: true,
            _isParamCall: true,
        };
    }

    if (arg.type === 'ObjectExpression') {
        arg.properties = arg.properties.map((prop: any) => {
            // Get the variable name and kind
            if (prop.value.name) {
                const [scopedName, kind] = scopeManager.getVariable(prop.value.name);

                // Convert shorthand to full property definition
                return {
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: prop.key.name,
                    },
                    value: ASTFactory.createContextVariableReference(kind, scopedName),
                    kind: 'init',
                    method: false,
                    shorthand: false,
                    computed: false,
                };
            }
            return prop;
        });
    }
    // For non-array-access arguments
    if (arg.type === 'Identifier') {
        if (arg.name === 'na') {
            arg.name = 'NaN';
            return arg;
        }
        // If it's a context-bound variable (like a nested function parameter), use it directly
        if (scopeManager.isContextBound(arg.name) && !scopeManager.isRootParam(arg.name)) {
            const memberExpr = ASTFactory.createMemberExpression(ASTFactory.createIdentifier(namespace), ASTFactory.createIdentifier('param'));
            return {
                type: 'CallExpression',
                callee: memberExpr,
                arguments: [arg, UNDEFINED_ARG, scopeManager.nextParamIdArg],
                _transformed: true,
                _isParamCall: true,
            };
        }
    }

    // For all other cases, transform normally

    if (arg?.type === 'CallExpression') {
        transformCallExpression(arg, scopeManager, namespace);
    }

    const memberExpr = ASTFactory.createMemberExpression(ASTFactory.createIdentifier(namespace), ASTFactory.createIdentifier('param'));

    return {
        type: 'CallExpression',
        callee: memberExpr,
        arguments: [arg.type === 'Identifier' ? transformIdentifierForParam(arg, scopeManager) : arg, UNDEFINED_ARG, scopeManager.nextParamIdArg],
        _transformed: true,
        _isParamCall: true,
    };
}

export function transformCallExpression(node: any, scopeManager: ScopeManager, namespace?: string): void {
    // Skip if this node has already been transformed
    if (node._transformed) {
        return;
    }

    // Check if this is a namespace method call (e.g., ta.ema, math.abs)
    const isNamespaceCall =
        node.callee &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object &&
        node.callee.object.type === 'Identifier' &&
        (scopeManager.isContextBound(node.callee.object.name) || node.callee.object.name === 'math' || node.callee.object.name === 'ta');

    if (isNamespaceCall) {
        const namespace = node.callee.object.name;
        // Transform arguments using the namespace's param
        node.arguments = node.arguments.map((arg: any) => {
            // If argument is already a param call, don't wrap it again
            if (arg._isParamCall) {
                return arg;
            }
            return transformFunctionArgument(arg, namespace, scopeManager);
        });

        // Inject unique call ID for TA functions to enable proper state management
        if (namespace === 'ta') {
            node.arguments.push(scopeManager.getNextTACallId());
        }

        node._transformed = true;
    }
    // Check if this is a regular function call (not a namespace method)
    else if (node.callee && node.callee.type === 'Identifier') {
        // Transform arguments using $.param
        node.arguments = node.arguments.map((arg: any) => {
            // If argument is already a param call, don't wrap it again
            if (arg._isParamCall) {
                return arg;
            }
            return transformFunctionArgument(arg, CONTEXT_NAME, scopeManager);
        });
        node._transformed = true;
    }

    // Transform any nested call expressions in the arguments
    node.arguments.forEach((arg: any) => {
        walk.recursive(arg, scopeManager, {
            Identifier(node: any, state: any, c: any) {
                node.parent = state.parent;
                transformIdentifier(node, scopeManager);
                const isBinaryOperation = node.parent && node.parent.type === 'BinaryExpression';
                const isConditional = node.parent && node.parent.type === 'ConditionalExpression';

                if (isConditional || isBinaryOperation) {
                    if (node.type === 'MemberExpression') {
                        transformArrayIndex(node, scopeManager);
                    } else if (node.type === 'Identifier') {
                        addArrayAccess(node, scopeManager);
                    }
                }
            },
            CallExpression(node: any, state: any, c: any) {
                if (!node._transformed) {
                    // First transform the call expression itself
                    transformCallExpression(node, state);
                }
            },
            MemberExpression(node: any, state: any, c: any) {
                transformMemberExpression(node, '', scopeManager);
                // Then continue with object transformation
                if (node.object) {
                    c(node.object, { parent: node, inNamespaceCall: state.inNamespaceCall });
                }
            },
        });
    });
}
