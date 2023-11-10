class configType {
  childrenName?: string
  pidName?: string
  primaryKeyName?: string
}

let config: configType = { childrenName: 'children', pidName: 'pid', primaryKeyName: 'id' }

export const globalConfig = (c: configType) => {
  config = Object.assign(config, c)
}

class T {
  private treeData
  public result

  private childrenName
  private primaryKeyName
  private pidName

  constructor(data) {
    if (data) {
      this.treeData = data
      this.result = data
    }

    const { childrenName, primaryKeyName, pidName } = config
    this.childrenName = childrenName
    this.primaryKeyName = primaryKeyName
    this.pidName = pidName
  }

  private matchCondition(node, condition, options) {
    for (let key in condition) {
      if (options?.useLike) {
        if (node[key].indexOf(condition[key]) < 0) {
          return false
        }
      } else {
        if (node[key] !== condition[key]) {
          return false
        }
      }
    }
    return true
  }

  private removeArrayItem(arr, index) {
    arr.splice(index, 1)
    return arr
  }

  // 私有方法,返回索引,和children本身,不支持链式调用
  private getCurrentIndex() {
    const current = this.result
    const parent = this.parent().result
    const children = parent[this.childrenName] || parent
    this.result = current
    return { index: children.findIndex((node) => node === current), children }
  }

  setConfig(c: configType) {
    const { childrenName, primaryKeyName, pidName } = c
    childrenName && (this.childrenName = childrenName)
    primaryKeyName && (this.primaryKeyName = primaryKeyName)
    pidName && (this.pidName = pidName)
    return this
  }

  // 已废弃
  // clearConfig() {
  //   config = { childrenName: 'children', pidName: 'pid', primaryKeyName: 'id' }
  //   return this
  // }

  showConfig() {
    console.log(this.childrenName, this.primaryKeyName, this.pidName)
    return this
  }

  // 传入树中存在节点索引
  current(node) {
    this.result = node
    return this
  }

  // getAll链式调用仅支持remove
  getAll(condition, options?) {
    const result: object[] = []

    const traverse = (nodes) => {
      for (let node of nodes) {
        if (this.matchCondition(node, condition, options)) {
          result.push(node)
        }
        if (node[this.childrenName] && node[this.childrenName].length > 0) {
          traverse(node[this.childrenName])
        }
      }
    }

    traverse(this.treeData)
    this.result = result
    return this
  }

  getFirst(condition, options?) {
    let result = null
    const traverse = (nodes) => {
      for (let node of nodes) {
        if (this.matchCondition(node, condition, options)) {
          return (result = node)
        }
        if (node[this.childrenName] && node[this.childrenName].length > 0) {
          traverse(node[this.childrenName])
        }
      }
    }
    traverse(this.treeData)
    this.result = result
    return this
  }

  getByKeys(keyName, arr, options?) {
    const useLike = options?.useLike
    let result:any = []
    if (useLike) {
      this.map((node) => {
        arr.forEach((item) => {
          if (node[keyName].indexOf(item) >= 0) {
            result.push(node)
          }
        })
      })
    } else {
      this.map((node) => {
        if (arr.includes(node[keyName])) {
          result.push(node)
        }
      })
    }
    this.result = result
    return this
  }

  first() {
    this.result = this.result[0]
    return this
  }

  parents() {
    // 原理,从头开始无脑往数组里加树节点,直到找到一个节点等于要搜索的,就把遍历到的节点加入到result中,找不到,这个result中push的东西就废了,不要了
    let result: object[] = []
    const traverse = (target, nodes, parent: object[] = []) => {
      for (let node of nodes) {
        if (node[this.childrenName]) {
          const current = node
          if (node[this.childrenName].some((child) => child === target)) {
            result.push(...parent, current)
          }
          traverse(target, node[this.childrenName], [...parent, current])
        }
      }
    }
    // 对应getAll获取到的数据
    if (Array.isArray(this.result)) {
      this.result.forEach((item) => {
        traverse(item, this.treeData)
      })
    } else {
      traverse(this.result, this.treeData)
    }
    this.result = result
    return this
  }

  parent() {
    let result = null
    const traverse = (target, nodes) => {
      for (let node of nodes) {
        if (node === target) {
          return (result = nodes)
        }
        if (node[this.childrenName]) {
          if (node[this.childrenName].some((child) => child === target)) {
            return (result = node)
          }
          traverse(target, node[this.childrenName])
        }
      }
    }
    traverse(this.result, this.treeData)
    this.result = result
    return this
  }

  // 以传入的节点为根,向下查找
  flat() {
    const result: object[] = []
    const traverse = (node) => {
      result.push(node)
      if (node[this.childrenName]) {
        node[this.childrenName].forEach((child) => {
          traverse(child)
        })
      }
    }
    traverse(this.result)
    this.result = result
    return this
  }

  // 循环所有节点 支持链式调用
  map(cb) {
    const traverse = (nodes) => {
      const temp = Array.isArray(nodes)?nodes:[nodes]
      for (let node of temp) {
        cb && cb(node)
        if (node[this.childrenName] && node[this.childrenName].length > 0) {
          traverse(node[this.childrenName])
        }
      }
    }

    traverse(this.result)
    return this
  }

  next() {
    const current = this.result
    const parent = this.parent().result
    if (parent) {
      const children = parent[this.childrenName] || parent
      let currentIndex = 0
      children.forEach((node, index) => {
        if (node === current) {
          currentIndex = index
        }
      })
      this.result = currentIndex < children.length - 1 ? children[currentIndex + 1] : null
    } else {
      this.result = null
    }
    return this
  }

  nextAll() {
    const current = this.result
    const parent = this.parent().result
    if (parent) {
      const children = parent[this.childrenName] || parent
      let flag = false
      const result: object[] = []
      for (let i = 0; i < children.length; i++) {
        const node = children[i]
        if (node === current) {
          flag = true
          continue
        }
        if (flag) {
          result.push(node)
        }
      }
      this.result = result
    } else {
      this.result = []
    }
    return this
  }

  prev() {
    const current = this.result
    const parent = this.parent().result
    if (parent) {
      const children = parent[this.childrenName] || parent
      let currentIndex = 0
      children.forEach((node, index) => {
        if (node === current) {
          currentIndex = index
        }
      })
      this.result = currentIndex > 0 ? children[currentIndex - 1] : null
    } else {
      this.result = null
    }
    return this
  }

  prevAll() {
    const current = this.result
    const parent = this.parent().result
    if (parent) {
      const children = parent[this.childrenName] || parent
      let flag = true
      const result: object[] = []
      for (let i = 0; i < children.length; i++) {
        const node = children[i]
        if (node === current) {
          flag = false
          continue
        }
        if (flag) {
          result.push(node)
        }
      }
      this.result = result
    } else {
      this.result = []
    }
    return this
  }

  siblings() {
    const current = this.result
    const parent = this.parent().result
    if (parent) {
      const children = parent[this.childrenName] || parent
      const result: object[] = []
      for (let i = 0; i < children.length; i++) {
        const node = children[i]
        if (node !== current) {
          result.push(node)
        }
      }
      this.result = result
    } else {
      this.result = []
    }
    return this
  }

  // 单个删除返回删除后节点的父节点,可以继续链式调用,批量删除返回数组,无法继续链式调用
  // 可以传入一个树中的节点,表示要对其进行删除
  remove(treeNode?) {
    const deletedNode = treeNode || this.result
    // 如果是根节点,直接删除就完事
    if (deletedNode === this.treeData) {
      this.result = []
      return this
    }

    const isBatchRemove = Array.isArray(deletedNode)
    const current = isBatchRemove ? deletedNode : [deletedNode]
    // let result = []
    current.forEach((item) => {
      // 为了this.parent使用
      this.result = item

      const parent = this.parent().result
      if (parent) {
        const children = parent[this.childrenName] || parent
        const index = children.findIndex((node) => node === item)
        if (index !== -1) {
          children.splice(index, 1)
        }
        // result.push(parent)
      }
    })
    this.result = this.treeData
    return this
  }

  // 传入数组类型的数据,可以批量插入
  prepend(newArr) {
    const { index, children } = this.getCurrentIndex()
    children.splice(index, 0, ...newArr)
    this.result = children
    return this
  }

  append(newArr) {
    const { index, children } = this.getCurrentIndex()
    children.splice(index + 1, 0, ...newArr)
    this.result = children
    return this
  }

  clone() {
    const deepClone = (obj) => {
      if (typeof obj !== 'object' || obj === null) {
        return obj
      }

      if (Array.isArray(obj)) {
        const copy: object[] = []
        obj.forEach(function (item) {
          copy.push(deepClone(item))
        })
        return copy
      }

      const copy = {}
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          copy[key] = deepClone(obj[key])
        }
      }
      return copy
    }
    this.result = deepClone(this.result)
    return this
  }

  // list必须传入rootId(根id)
  listToTree(list, rootId) {
    if (rootId === undefined) {
      throw new Error('rootId is required')
    }
    // 判断根是否存在
    let hasRoot = false
    list.forEach((item) => {
      if (item.pid === rootId) {
        hasRoot = true
      }
    })
    if (!hasRoot) {
      // 找不到根
      throw new Error('cannot find tree root!')
    }
    const map = {}
    const result: object[] = []
    const traverse = (data, pid) => {
      for (const item of data) {
        map[item.id] = { ...item }
      }
      for (const item of data) {
        const node = map[item.id]
        if (item.pid === pid) {
          result.push(node)
        } else {
          // 滚雪球,利用了对象引用地址的一致性,map和result同一对象的引用地址总是一样的
          // 先在result中生成了根节点
          // 找到的节点根据pid和id的关系挂children挂到最后根节点,map是一个临时的变量
          // 有意义的树节点会push到result中
          const parent = map[item.pid]
          if (!parent[this.childrenName]) {
            parent[this.childrenName] = []
          }
          parent[this.childrenName].push(node)
        }
      }
    }
    traverse(list, rootId)
    this.result = result
    this.treeData = result
    return this
  }

  treeToList() {
    let result: object[] = []
    const traverse = (tree, parentId = null) => {
      tree.forEach((node) => {
        const temp = {}
        for (let key in node) {
          if (key !== this.childrenName) {
            temp[key] = node[key]
            temp[this.pidName] = parentId
          }
        }
        result.push(temp)
        const childNode = node[this.childrenName]
        if (childNode && childNode.length > 0) {
          traverse(childNode, node[this.primaryKeyName])
        }
      })
    }

    traverse(this.treeData)
    this.result = result
    return this
  }

  // 直接返回长度,不支持链式调用
  siblingsLength() {
    const len = this.parent().result[this.childrenName].length
    return len - 1 //减去自己
  }

  // 直接返回数组,不支持链式调用 deep表示递归,默认true
  toFieldArray(key, deep = true) {
    let result: object[] = []
    if (deep) {
      this.map((item) => result.push(item[key]))
    } else {
      result = this.result.map((item) => item[key])
    }
    return result
  }

  // 画一个表格,类似于antd的组件props属性,显示每个方法的参数,默认值,返回类型等
  // 可配置config,用于children.pid的更换
}

export default (treeData?) => new T(treeData)
