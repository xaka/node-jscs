/**
 * Disallows space before `()` or `{}` in anonymous function expressions.
 *
 * Type: `Object`
 *
 * Values: `"beforeOpeningRoundBrace"` and `"beforeOpeningCurlyBrace"` as child properties.
 * Child properties must be set to `true`.
 *
 * #### Example
 *
 * ```js
 * "disallowSpacesInAnonymousFunctionExpression": {
 *     "beforeOpeningRoundBrace": true,
 *     "beforeOpeningCurlyBrace": true
 * }
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var foo = function(){};
 * var Foo = {
 *     foo: function(){};
 * }
 * array.map(function(){});
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var foo = function () {};
 * var Foo = {
 *     foo: function (){};
 * }
 * array.map(function() {});
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            typeof options === 'object',
            'disallowSpacesInAnonymousFunctionExpression option must be the object'
        );

        if ('beforeOpeningRoundBrace' in options) {
            assert(
                options.beforeOpeningRoundBrace === true,
                'disallowSpacesInAnonymousFunctionExpression.beforeOpeningRoundBrace ' +
                'property requires true value or should be removed'
            );
        }

        if ('beforeOpeningCurlyBrace' in options) {
            assert(
                options.beforeOpeningCurlyBrace === true,
                'disallowSpacesInAnonymousFunctionExpression.beforeOpeningCurlyBrace ' +
                'property requires true value or should be removed'
            );
        }

        assert(
            options.beforeOpeningCurlyBrace || options.beforeOpeningRoundBrace,
            'disallowSpacesInAnonymousFunctionExpression must have beforeOpeningCurlyBrace ' +
            ' or beforeOpeningRoundBrace property'
        );

        this._beforeOpeningRoundBrace = Boolean(options.beforeOpeningRoundBrace);
        this._beforeOpeningCurlyBrace = Boolean(options.beforeOpeningCurlyBrace);
    },

    getOptionName: function() {
        return 'disallowSpacesInAnonymousFunctionExpression';
    },

    check: function(file, errors) {
        var beforeOpeningRoundBrace = this._beforeOpeningRoundBrace;
        var beforeOpeningCurlyBrace = this._beforeOpeningCurlyBrace;
        var tokens = file.getTokens();

        file.iterateNodesByType(['FunctionExpression'], function(node) {
            var parent = node.parentNode;

            // Ignore syntactic sugar for getters and setters.
            if (parent.type === 'Property' && (parent.kind === 'get' || parent.kind === 'set')) {
                return;
            }

            // anonymous function expressions only
            if (!node.id) {

                if (beforeOpeningRoundBrace) {
                    var nodeBeforeRoundBrace = node;

                    var functionTokenPos = file.getTokenPosByRangeStart(nodeBeforeRoundBrace.range[0]);
                    var functionToken = tokens[functionTokenPos];

                    var nextTokenPos = file.getTokenPosByRangeStart(functionToken.range[1]);
                    var nextToken = tokens[nextTokenPos];

                    if (!nextToken) {
                        errors.add(
                            'Illegal space before opening round brace',
                            functionToken.loc.end
                        );
                    }
                }

                if (beforeOpeningCurlyBrace) {
                    var tokenBeforeBodyPos = file.getTokenPosByRangeStart(node.body.range[0] - 1);
                    var tokenBeforeBody = tokens[tokenBeforeBodyPos];

                    if (!tokenBeforeBody) {
                        errors.add(
                            'Illegal space before opening curly brace',
                            node.body.loc.start
                        );
                    }
                }
            }
        });
    }

};
