var treeOperator = (function (exports) {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol */


    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    var config = { childrenName: 'children', pidName: 'pid', primaryKeyName: 'id' };
    var globalConfig = function (c) {
        config = Object.assign(config, c);
    };
    var T = /** @class */ (function () {
        function T(data) {
            var _this = this;
            this.deepClone = function (obj) {
                if (typeof obj !== 'object' || obj === null) {
                    return obj;
                }
                if (Array.isArray(obj)) {
                    var copy_1 = [];
                    obj.forEach(function (item) {
                        // 使用箭头函数保持this上下文
                        copy_1.push(_this.deepClone(item));
                    });
                    return copy_1;
                }
                var copy = {};
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        copy[key] = _this.deepClone(obj[key]);
                    }
                }
                return copy;
            };
            if (data) {
                this.treeData = data;
                this.result = data;
            }
            var childrenName = config.childrenName, primaryKeyName = config.primaryKeyName, pidName = config.pidName;
            this.childrenName = childrenName;
            this.primaryKeyName = primaryKeyName;
            this.pidName = pidName;
        }
        T.prototype.matchCondition = function (node, condition, options) {
            for (var key in condition) {
                if (options === null || options === void 0 ? void 0 : options.useLike) {
                    if (node[key].indexOf(condition[key]) < 0) {
                        return false;
                    }
                }
                else {
                    if (node[key] !== condition[key]) {
                        return false;
                    }
                }
            }
            return true;
        };
        T.prototype.removeArrayItem = function (arr, index) {
            arr.splice(index, 1);
            return arr;
        };
        // 私有方法,返回索引,和children本身,不支持链式调用
        T.prototype.getCurrentIndex = function () {
            var current = this.result;
            var parent = this.parent().result;
            var children = parent[this.childrenName] || parent;
            this.result = current;
            return { index: children.findIndex(function (node) { return node === current; }), children: children };
        };
        T.prototype.setConfig = function (c) {
            var childrenName = c.childrenName, primaryKeyName = c.primaryKeyName, pidName = c.pidName;
            childrenName && (this.childrenName = childrenName);
            primaryKeyName && (this.primaryKeyName = primaryKeyName);
            pidName && (this.pidName = pidName);
            return this;
        };
        // 已废弃
        // clearConfig() {
        //   config = { childrenName: 'children', pidName: 'pid', primaryKeyName: 'id' }
        //   return this
        // }
        T.prototype.showConfig = function () {
            console.log(this.childrenName, this.primaryKeyName, this.pidName);
            return this;
        };
        // 传入树中存在节点索引
        T.prototype.current = function (node) {
            this.result = node;
            return this;
        };
        // getAll链式调用仅支持remove
        T.prototype.getAll = function (condition, options) {
            var _this = this;
            var result = [];
            var traverse = function (nodes) {
                for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                    var node = nodes_1[_i];
                    if (_this.matchCondition(node, condition, options)) {
                        result.push(node);
                    }
                    if (node[_this.childrenName] && node[_this.childrenName].length > 0) {
                        traverse(node[_this.childrenName]);
                    }
                }
            };
            traverse(this.treeData);
            this.result = result;
            return this;
        };
        T.prototype.getFirst = function (condition, options) {
            var _this = this;
            var result = null;
            var traverse = function (nodes) {
                for (var _i = 0, nodes_2 = nodes; _i < nodes_2.length; _i++) {
                    var node = nodes_2[_i];
                    if (_this.matchCondition(node, condition, options)) {
                        return (result = node);
                    }
                    if (node[_this.childrenName] && node[_this.childrenName].length > 0) {
                        traverse(node[_this.childrenName]);
                    }
                }
            };
            traverse(this.treeData);
            this.result = result;
            return this;
        };
        T.prototype.getByKeys = function (keyName, arr, options) {
            var useLike = options === null || options === void 0 ? void 0 : options.useLike;
            var result = [];
            if (useLike) {
                this.forEach(function (node) {
                    arr.forEach(function (item) {
                        if (node[keyName].indexOf(item) >= 0) {
                            result.push(node);
                        }
                    });
                });
            }
            else {
                this.forEach(function (node) {
                    if (arr.includes(node[keyName])) {
                        result.push(node);
                    }
                });
            }
            this.result = result;
            return this;
        };
        T.prototype.first = function () {
            this.result = this.result[0];
            return this;
        };
        T.prototype.parents = function () {
            var _this = this;
            // 原理,从头开始无脑往数组里加树节点,直到找到一个节点等于要搜索的,就把遍历到的节点加入到result中,找不到,这个result中push的东西就废了,不要了
            var result = [];
            var traverse = function (target, nodes, parent) {
                if (parent === void 0) { parent = []; }
                for (var _i = 0, nodes_3 = nodes; _i < nodes_3.length; _i++) {
                    var node = nodes_3[_i];
                    if (node[_this.childrenName]) {
                        var current = node;
                        if (node[_this.childrenName].some(function (child) { return child === target; })) {
                            result.push.apply(result, __spreadArray(__spreadArray([], parent, false), [current], false));
                        }
                        traverse(target, node[_this.childrenName], __spreadArray(__spreadArray([], parent, true), [current], false));
                    }
                }
            };
            // 对应getAll获取到的数据
            if (Array.isArray(this.result)) {
                this.result.forEach(function (item) {
                    traverse(item, _this.treeData);
                });
            }
            else {
                traverse(this.result, this.treeData);
            }
            this.result = result;
            return this;
        };
        T.prototype.parent = function () {
            var _this = this;
            var result = null;
            var traverse = function (target, nodes) {
                for (var _i = 0, nodes_4 = nodes; _i < nodes_4.length; _i++) {
                    var node = nodes_4[_i];
                    if (node === target) {
                        return (result = nodes);
                    }
                    if (node[_this.childrenName]) {
                        if (node[_this.childrenName].some(function (child) { return child === target; })) {
                            return (result = node);
                        }
                        traverse(target, node[_this.childrenName]);
                    }
                }
            };
            traverse(this.result, this.treeData);
            this.result = result;
            return this;
        };
        // 以传入的节点为根,向下查找
        T.prototype.flat = function () {
            var _this = this;
            var result = [];
            var traverse = function (node) {
                result.push(node);
                if (node[_this.childrenName]) {
                    node[_this.childrenName].forEach(function (child) {
                        traverse(child);
                    });
                }
            };
            traverse(this.result);
            this.result = result;
            return this;
        };
        // 循环所有节点 支持链式调用
        T.prototype.forEach = function (cb) {
            var _this = this;
            var traverse = function (nodes, parentIndex) {
                var temp = Array.isArray(nodes) ? nodes : [nodes];
                for (var i = 0; i < temp.length; i++) {
                    var node = temp[i];
                    var index = i;
                    var isFirst = index === 0;
                    var isLast = index === temp.length - 1;
                    cb && cb(node, { index: index, isFirst: isFirst, isLast: isLast });
                    if (node[_this.childrenName] && node[_this.childrenName].length > 0) {
                        traverse(node[_this.childrenName]);
                    }
                }
            };
            traverse(this.result);
            return this;
        };
        T.prototype.next = function () {
            var current = this.result;
            var parent = this.parent().result;
            if (parent) {
                var children = parent[this.childrenName] || parent;
                var currentIndex_1 = 0;
                children.forEach(function (node, index) {
                    if (node === current) {
                        currentIndex_1 = index;
                    }
                });
                this.result = currentIndex_1 < children.length - 1 ? children[currentIndex_1 + 1] : null;
            }
            else {
                this.result = null;
            }
            return this;
        };
        T.prototype.nextAll = function () {
            var current = this.result;
            var parent = this.parent().result;
            if (parent) {
                var children = parent[this.childrenName] || parent;
                var flag = false;
                var result = [];
                for (var i = 0; i < children.length; i++) {
                    var node = children[i];
                    if (node === current) {
                        flag = true;
                        continue;
                    }
                    if (flag) {
                        result.push(node);
                    }
                }
                this.result = result;
            }
            else {
                this.result = [];
            }
            return this;
        };
        T.prototype.prev = function () {
            var current = this.result;
            var parent = this.parent().result;
            if (parent) {
                var children = parent[this.childrenName] || parent;
                var currentIndex_2 = 0;
                children.forEach(function (node, index) {
                    if (node === current) {
                        currentIndex_2 = index;
                    }
                });
                this.result = currentIndex_2 > 0 ? children[currentIndex_2 - 1] : null;
            }
            else {
                this.result = null;
            }
            return this;
        };
        T.prototype.prevAll = function () {
            var current = this.result;
            var parent = this.parent().result;
            if (parent) {
                var children = parent[this.childrenName] || parent;
                var flag = true;
                var result = [];
                for (var i = 0; i < children.length; i++) {
                    var node = children[i];
                    if (node === current) {
                        flag = false;
                        continue;
                    }
                    if (flag) {
                        result.push(node);
                    }
                }
                this.result = result;
            }
            else {
                this.result = [];
            }
            return this;
        };
        T.prototype.siblings = function () {
            var current = this.result;
            var parent = this.parent().result;
            if (parent) {
                var children = parent[this.childrenName] || parent;
                var result = [];
                for (var i = 0; i < children.length; i++) {
                    var node = children[i];
                    if (node !== current) {
                        result.push(node);
                    }
                }
                this.result = result;
            }
            else {
                this.result = [];
            }
            return this;
        };
        // 单个删除返回删除后节点的父节点,可以继续链式调用,批量删除返回数组,无法继续链式调用
        // 可以传入一个树中的节点,表示要对其进行删除
        T.prototype.remove = function (treeNode) {
            var _this = this;
            var deletedNode = treeNode || this.result;
            // 如果是根节点,直接删除就完事
            if (deletedNode === this.treeData) {
                this.result = [];
                return this;
            }
            var isBatchRemove = Array.isArray(deletedNode);
            var current = isBatchRemove ? deletedNode : [deletedNode];
            // let result = []
            current.forEach(function (item) {
                // 为了this.parent使用
                _this.result = item;
                var parent = _this.parent().result;
                if (parent) {
                    var children = parent[_this.childrenName] || parent;
                    var index = children.findIndex(function (node) { return node === item; });
                    if (index !== -1) {
                        children.splice(index, 1);
                    }
                    // result.push(parent)
                }
            });
            this.result = this.treeData;
            return this;
        };
        // 传入数组类型的数据,可以批量插入
        T.prototype.prepend = function (newArr) {
            var _a = this.getCurrentIndex(), index = _a.index, children = _a.children;
            children.splice.apply(children, __spreadArray([index, 0], newArr, false));
            this.result = children;
            return this;
        };
        T.prototype.append = function (newArr) {
            var _a = this.getCurrentIndex(), index = _a.index, children = _a.children;
            children.splice.apply(children, __spreadArray([index + 1, 0], newArr, false));
            this.result = children;
            return this;
        };
        T.prototype.clone = function () {
            this.result = this.deepClone(this.result);
            return this;
        };
        // list支持自动识别根节点; 传入rootId则仅以该rootId为根挂载顶层
        T.prototype.listToTree = function (rootId) {
            var idKey = this.primaryKeyName;
            var pidKey = this.pidName;
            if (!Array.isArray(this.treeData)) {
                throw new Error('list must be an array');
            }
            var map = {};
            var result = [];
            // 先克隆所有节点到map，键为id
            for (var _i = 0, _a = this.treeData; _i < _a.length; _i++) {
                var item = _a[_i];
                map[item[idKey]] = __assign({}, item);
            }
            // 构建父子关系，并确定顶层节点
            for (var _b = 0, _c = this.treeData; _b < _c.length; _b++) {
                var item = _c[_b];
                var node = map[item[idKey]];
                var parentId = item[pidKey];
                var parent_1 = map[parentId];
                var isTopByRootId = rootId !== undefined && parentId === rootId;
                var isAutoTop = rootId === undefined && (!parent_1 || parentId === null || parentId === undefined);
                if (isTopByRootId || isAutoTop) {
                    result.push(node);
                }
                else if (parent_1) {
                    if (!parent_1[this.childrenName]) {
                        parent_1[this.childrenName] = [];
                    }
                    parent_1[this.childrenName].push(node);
                }
                else ;
            }
            if (result.length === 0) {
                throw new Error('cannot find tree root!');
            }
            this.result = result;
            this.treeData = result;
            return this;
        };
        T.prototype.treeToList = function () {
            var _this = this;
            var result = [];
            var traverse = function (tree, parentId) {
                if (parentId === void 0) { parentId = null; }
                tree.forEach(function (node) {
                    var temp = {};
                    for (var key in node) {
                        if (key !== _this.childrenName) {
                            temp[key] = node[key];
                            temp[_this.pidName] = parentId || node[_this.pidName];
                        }
                    }
                    result.push(temp);
                    var childNode = node[_this.childrenName];
                    if (childNode && childNode.length > 0) {
                        traverse(childNode, node[_this.primaryKeyName]);
                    }
                });
            };
            traverse(this.treeData);
            this.result = result;
            return this;
        };
        // 直接返回长度,不支持链式调用
        T.prototype.siblingsLength = function () {
            var len = this.parent().result[this.childrenName].length;
            return len - 1; //减去自己
        };
        // 直接返回数组,不支持链式调用 deep表示递归,默认true
        T.prototype.toFieldArray = function (key, deep) {
            if (deep === void 0) { deep = true; }
            var result = [];
            if (deep) {
                this.forEach(function (item) { return result.push(item[key]); });
            }
            else {
                result = this.result.map(function (item) { return item[key]; });
            }
            return result;
        };
        // 给每一个节点添加深度标识
        T.prototype.addDepth = function (fieldName) {
            var _this = this;
            if (fieldName === void 0) { fieldName = 'depth'; }
            var traverse = function (nodes, depth) {
                if (depth === void 0) { depth = 0; }
                var temp = Array.isArray(nodes) ? nodes : [nodes];
                for (var _i = 0, temp_1 = temp; _i < temp_1.length; _i++) {
                    var node = temp_1[_i];
                    node[fieldName] = depth;
                    if (node[_this.childrenName] && node[_this.childrenName].length > 0) {
                        traverse(node[_this.childrenName], depth + 1);
                    }
                }
            };
            traverse(this.result);
            return this;
        };
        // 获取右侧路径：从根到叶子节点的最右侧路径
        // 始终查找树的最右侧节点并返回最右侧节点组成的树
        T.prototype.getRightNodes = function (cb) {
            var path = [];
            var nodes = Array.isArray(this.result) ? this.result : [this.result];
            while (nodes.length > 0) {
                var rightmost = nodes[nodes.length - 1];
                if (!rightmost)
                    break;
                path.push(rightmost);
                cb === null || cb === void 0 ? void 0 : cb(rightmost);
                nodes = rightmost[this.childrenName] || [];
            }
            this.result = path;
            return this;
        };
        T.prototype.filter = function (condition) {
            var _this = this;
            // 过滤节点的递归函数
            var filterNodes = function (nodes) {
                if (!Array.isArray(nodes))
                    return nodes;
                var filteredNodes = [];
                for (var _i = 0, nodes_5 = nodes; _i < nodes_5.length; _i++) {
                    var node = nodes_5[_i];
                    // 检查当前节点是否满足条件
                    if (condition(node)) {
                        // 如果满足条件，复制该节点
                        var newNode = _this.deepClone(node);
                        // 如果节点有子节点，递归过滤子节点
                        if (newNode[_this.childrenName] &&
                            Array.isArray(newNode[_this.childrenName]) &&
                            newNode[_this.childrenName].length > 0) {
                            newNode[_this.childrenName] = filterNodes(newNode[_this.childrenName]);
                        }
                        filteredNodes.push(newNode);
                    }
                    else {
                        // 如果当前节点不满足条件，但仍需要检查其子节点
                        // 因为子节点可能满足条件，需要保留子树结构
                        if (node[_this.childrenName] &&
                            Array.isArray(node[_this.childrenName]) &&
                            node[_this.childrenName].length > 0) {
                            var filteredChildren = filterNodes(node[_this.childrenName]);
                            // 如果子节点中有满足条件的节点，则将这些节点添加到结果中
                            if (filteredChildren.length > 0) {
                                var newNode = _this.deepClone(node);
                                newNode[_this.childrenName] = filteredChildren;
                                filteredNodes.push(newNode);
                            }
                        }
                    }
                }
                return filteredNodes;
            };
            // 对整个树进行过滤
            var filteredTree = filterNodes(this.treeData);
            this.result = filteredTree;
            return this;
        };
        return T;
    }());
    var index = (function (treeData) { return new T(treeData); });

    exports.default = index;
    exports.globalConfig = globalConfig;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
