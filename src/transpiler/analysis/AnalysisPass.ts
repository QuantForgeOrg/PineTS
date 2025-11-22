// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2025 Alaa-eddine KADDOURI

import * as walk from 'acorn-walk';
import ScopeManager from './ScopeManager';
import { CONTEXT_NAME } from '../utils/ASTFactory';

export function transformNestedArrowFunctions(ast: any): void {
    walk.recursive(ast, null, {
        VariableDeclaration(node: any, state: any, c: any) {
            // Only process if we have declarations
            if (node.declarations && node.declarations.length > 0) {
                const declarations = node.declarations;

                // Check each declaration
                declarations.forEach((decl: any) => {
                    // Check if it's an arrow function
                    if (decl.init && decl.init.type === 'ArrowFunctionExpression') {
                        const isRootFunction = decl.init.start === 0;

                        if (!isRootFunction) {
                            // Create a function declaration
                            const functionDeclaration = {
                                type: 'FunctionDeclaration',
                                id: decl.id, // Use the variable name as function name
                                params: decl.init.params,
                                body:
                                    decl.init.body.type === 'BlockStatement'
                                        ? decl.init.body
                                        : {
                                              type: 'BlockStatement',
                                              body: [
                                                  {
                                                      type: 'ReturnStatement',
                                                      argument: decl.init.body,
                                                  },
                                              ],
                                          },
                                async: decl.init.async,
                                generator: false,
                            };

                            // Replace the entire VariableDeclaration with the FunctionDeclaration
                            Object.assign(node, functionDeclaration);
                        }
                    }
                });
            }

            // Continue traversing
            if (node.body && node.body.body) {
                node.body.body.forEach((stmt: any) => c(stmt, state));
            }
        },
    });
}

export function preProcessContextBoundVars(ast: any, scopeManager: ScopeManager): void {
    walk.simple(ast, {
        VariableDeclaration(node: any) {
            node.declarations.forEach((decl: any) => {
                // Check for context property assignments
                const isContextProperty =
                    decl.init &&
                    decl.init.type === 'MemberExpression' &&
                    decl.init.object &&
                    (decl.init.object.name === 'context' || decl.init.object.name === CONTEXT_NAME || decl.init.object.name === 'context2');

                const isSubContextProperty =
                    decl.init &&
                    decl.init.type === 'MemberExpression' &&
                    decl.init.object?.object &&
                    (decl.init.object.object.name === 'context' ||
                        decl.init.object.object.name === CONTEXT_NAME ||
                        decl.init.object.object.name === 'context2');

                if (isContextProperty || isSubContextProperty) {
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
                }
            });
        },
    });
}

export function transformArrowFunctionParams(node: any, scopeManager: ScopeManager, isRootFunction: boolean = false): void {
    // Register arrow function parameters as context-bound
    node.params.forEach((param: any) => {
        if (param.type === 'Identifier') {
            scopeManager.addContextBoundVar(param.name, isRootFunction);
        }
    });
}

// Local helper to register function parameters without transforming body
function registerFunctionParameters(node: any, scopeManager: ScopeManager): void {
    // Register function parameters as context-bound (but not as root params)
    node.params.forEach((param: any) => {
        if (param.type === 'Identifier') {
            scopeManager.addContextBoundVar(param.name, false);
        }
    });
}

export function runAnalysisPass(ast: any, scopeManager: ScopeManager): string | undefined {
    let originalParamName: string | undefined;

    walk.simple(ast, {
        FunctionDeclaration(node: any) {
            registerFunctionParameters(node, scopeManager);
        },
        ArrowFunctionExpression(node: any) {
            const isRootFunction = node.start === 0;
            if (isRootFunction && node.params && node.params.length > 0) {
                originalParamName = node.params[0].name;
                node.params[0].name = CONTEXT_NAME;
            }
            transformArrowFunctionParams(node, scopeManager, isRootFunction);
        },
        VariableDeclaration(node: any) {
            node.declarations.forEach((decl: any) => {
                if (decl.id.type === 'ArrayPattern') {
                    // Generate a unique temporary variable name
                    const tempVarName = scopeManager.generateTempVar();

                    // Create a new variable declaration for the temporary variable
                    const tempVarDecl = {
                        type: 'VariableDeclaration',
                        kind: node.kind,
                        declarations: [
                            {
                                type: 'VariableDeclarator',
                                id: {
                                    type: 'Identifier',
                                    name: tempVarName,
                                },
                                init: decl.init,
                            },
                        ],
                    };

                    decl.id.elements?.forEach((element: any) => {
                        if (element.type === 'Identifier') {
                            scopeManager.addArrayPatternElement(element.name);
                        }
                    });
                    // Create individual variable declarations for each destructured element
                    const individualDecls = decl.id.elements.map((element: any, index: number) => ({
                        type: 'VariableDeclaration',
                        kind: node.kind,
                        declarations: [
                            {
                                type: 'VariableDeclarator',
                                id: element,
                                init: {
                                    type: 'MemberExpression',
                                    object: {
                                        type: 'Identifier',
                                        name: tempVarName,
                                    },
                                    property: {
                                        type: 'Literal',
                                        value: index,
                                    },
                                    computed: true,
                                },
                            },
                        ],
                    }));

                    // Replace the original declaration with the new declarations
                    Object.assign(node, {
                        type: 'BlockStatement',
                        body: [tempVarDecl, ...individualDecls],
                    });
                }
            });
        },
        ForStatement(node: any) {
            // Skip registering loop variables in the first pass
        },
    });

    return originalParamName;
}
