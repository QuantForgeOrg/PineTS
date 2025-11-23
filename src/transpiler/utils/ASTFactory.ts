// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2025 Alaa-eddine KADDOURI

export const CONTEXT_NAME = '$';

export const ASTFactory = {
    createIdentifier(name: string): any {
        return {
            type: 'Identifier',
            name,
        };
    },

    createLiteral(value: any): any {
        return {
            type: 'Literal',
            value,
        };
    },

    createMemberExpression(object: any, property: any, computed: boolean = false): any {
        return {
            type: 'MemberExpression',
            object,
            property,
            computed,
        };
    },

    createContextIdentifier(): any {
        return this.createIdentifier(CONTEXT_NAME);
    },

    // Create $.kind.name
    createContextVariableReference(kind: string, name: string): any {
        const context = this.createContextIdentifier();
        const kindId = this.createIdentifier(kind);
        const nameId = this.createIdentifier(name);

        return this.createMemberExpression(this.createMemberExpression(context, kindId, false), nameId, false);
    },

    // Create $.kind.name[0]
    createContextVariableAccess0(kind: string, name: string): any {
        const varRef = this.createContextVariableReference(kind, name);
        return this.createArrayAccess(varRef, 0);
    },

    createArrayAccess(object: any, index: any): any {
        const indexNode = typeof index === 'number' ? this.createLiteral(index) : index;
        return this.createMemberExpression(object, indexNode, true);
    },

    createLastElementAccess(object: any): any {
        // object[object.length - 1]
        const length = this.createMemberExpression(object, this.createIdentifier('length'), false);
        const index = {
            type: 'BinaryExpression',
            operator: '-',
            left: length,
            right: this.createLiteral(1),
        };
        return this.createMemberExpression(object, index, true);
    },

    createCallExpression(callee: any, args: any[]): any {
        return {
            type: 'CallExpression',
            callee,
            arguments: args,
        };
    },

    createAssignmentExpression(left: any, right: any, operator: string = '='): any {
        return {
            type: 'AssignmentExpression',
            operator,
            left,
            right,
        };
    },

    createExpressionStatement(expression: any): any {
        return {
            type: 'ExpressionStatement',
            expression,
        };
    },

    createInitCall(targetVarRef: any, value: any, lookbehind?: any): any {
        // $.init(target, value, lookbehind?)
        const initMethod = this.createMemberExpression(this.createContextIdentifier(), this.createIdentifier('init'), false);

        const args = [targetVarRef, value];
        if (lookbehind) {
            args.push(lookbehind);
        }

        return this.createCallExpression(initMethod, args);
    },

    // Create $.math.__eq(left, right)
    createMathEqCall(left: any, right: any): any {
        const mathObj = this.createMemberExpression(this.createContextIdentifier(), this.createIdentifier('math'), false);
        const eqMethod = this.createMemberExpression(mathObj, this.createIdentifier('__eq'), false);
        return this.createCallExpression(eqMethod, [left, right]);
    },

    createWrapperFunction(body: any): any {
        return {
            type: 'FunctionDeclaration',
            id: null,
            params: [this.createIdentifier('context')],
            body: {
                type: 'BlockStatement',
                body: [
                    {
                        type: 'ReturnStatement',
                        argument: body,
                    },
                ],
            },
        };
    },
};
