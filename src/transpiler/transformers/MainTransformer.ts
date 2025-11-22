// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2025 Alaa-eddine KADDOURI

import * as walk from 'acorn-walk';
import ScopeManager from '../analysis/ScopeManager';
import { ASTFactory } from '../utils/ASTFactory';
import { transformIdentifier, transformCallExpression, transformMemberExpression } from './ExpressionTransformer';
import {
    transformVariableDeclaration,
    transformReturnStatement,
    transformAssignmentExpression,
    transformForStatement,
    transformIfStatement,
    transformFunctionDeclaration,
} from './StatementTransformer';

export function transformEqualityChecks(ast: any): void {
    walk.simple(ast, {
        BinaryExpression(node: any) {
            // Check if this is an equality operator
            if (node.operator === '==' || node.operator === '===') {
                // Store the original operands
                const leftOperand = node.left;
                const rightOperand = node.right;

                // Transform the BinaryExpression into a CallExpression
                const callExpr = ASTFactory.createMathEqCall(leftOperand, rightOperand);
                callExpr._transformed = true;

                Object.assign(node, callExpr);
            }
        },
    });
}

export function runTransformationPass(ast: any, scopeManager: ScopeManager, originalParamName: string): void {
    walk.recursive(ast, scopeManager, {
        BlockStatement(node: any, state: ScopeManager, c: any) {
            //state.pushScope('block');
            node.body.forEach((stmt: any) => c(stmt, state));
            //state.popScope();
        },
        ReturnStatement(node: any, state: ScopeManager) {
            transformReturnStatement(node, state);
        },
        VariableDeclaration(node: any, state: ScopeManager) {
            transformVariableDeclaration(node, state);
        },
        Identifier(node: any, state: ScopeManager) {
            transformIdentifier(node, state);
        },
        CallExpression(node: any, state: ScopeManager) {
            transformCallExpression(node, state);
        },
        MemberExpression(node: any, state: ScopeManager) {
            transformMemberExpression(node, originalParamName, state);
        },
        AssignmentExpression(node: any, state: ScopeManager) {
            transformAssignmentExpression(node, state);
        },
        FunctionDeclaration(node: any, state: ScopeManager, c: any) {
            transformFunctionDeclaration(node, state, c);
        },
        ForStatement(node: any, state: ScopeManager, c: any) {
            transformForStatement(node, state, c);
        },
        IfStatement(node: any, state: ScopeManager, c: any) {
            transformIfStatement(node, state, c);
        },
    });
}
