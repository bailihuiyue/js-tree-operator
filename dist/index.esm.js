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
        if (data) {
            this.treeData = data;
            this.result = data;
        }
        var childrenName = config.childrenName, primaryKeyName = config.primaryKeyName, pidName = config.pidName;
        this.childrenName = childrenName;
        this.primaryKeyName = primaryKeyName;
        this.pidName = pidName;
    }
    T.prototype.matchCondition = function (node, condition) {
        for (var key in condition) {
            if (node[key] !== condition[key]) {
                return false;
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
    T.prototype.getAll = function (condition) {
        var _this = this;
        var result = [];
        var traverse = function (nodes) {
            for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                var node = nodes_1[_i];
                if (_this.matchCondition(node, condition)) {
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
    T.prototype.getFirst = function (condition) {
        var _this = this;
        var result = null;
        var traverse = function (nodes) {
            for (var _i = 0, nodes_2 = nodes; _i < nodes_2.length; _i++) {
                var node = nodes_2[_i];
                if (_this.matchCondition(node, condition)) {
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
        traverse(this.result, this.treeData);
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
    T.prototype.map = function (cb) {
        var _this = this;
        var traverse = function (nodes) {
            for (var _i = 0, nodes_5 = nodes; _i < nodes_5.length; _i++) {
                var node = nodes_5[_i];
                cb && cb(node);
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
        var deepClone = function (obj) {
            if (typeof obj !== 'object' || obj === null) {
                return obj;
            }
            if (Array.isArray(obj)) {
                var copy_1 = [];
                obj.forEach(function (item) {
                    copy_1.push(deepClone(item));
                });
                return copy_1;
            }
            var copy = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    copy[key] = deepClone(obj[key]);
                }
            }
            return copy;
        };
        this.result = deepClone(this.result);
        return this;
    };
    // list必须传入rootId(根id)
    T.prototype.listToTree = function (list, rootId) {
        var _this = this;
        if (rootId === undefined) {
            throw new Error('rootId is required');
        }
        // 判断根是否存在
        var hasRoot = false;
        list.forEach(function (item) {
            if (item.pid === rootId) {
                hasRoot = true;
            }
        });
        if (!hasRoot) {
            // 找不到根
            throw new Error('cannot find tree root!');
        }
        var map = {};
        var result = [];
        var traverse = function (data, pid) {
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var item = data_1[_i];
                map[item.id] = __assign({}, item);
            }
            for (var _a = 0, data_2 = data; _a < data_2.length; _a++) {
                var item = data_2[_a];
                var node = map[item.id];
                if (item.pid === pid) {
                    result.push(node);
                }
                else {
                    // 滚雪球,利用了对象引用地址的一致性,map和result同一对象的引用地址总是一样的
                    // 先在result中生成了根节点
                    // 找到的节点根据pid和id的关系挂children挂到最后根节点,map是一个临时的变量
                    // 有意义的树节点会push到result中
                    var parent_1 = map[item.pid];
                    if (!parent_1[_this.childrenName]) {
                        parent_1[_this.childrenName] = [];
                    }
                    parent_1[_this.childrenName].push(node);
                }
            }
        };
        traverse(list, rootId);
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
                        temp[_this.pidName] = parentId;
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
            this.map(function (item) { return result.push(item[key]); });
        }
        else {
            result = this.result.map(function (item) { return item[key]; });
        }
        return result;
    };
    return T;
}());
var index = (function (treeData) { return new T(treeData); });

export { index as default, globalConfig };
