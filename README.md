<h1 align="center">Tree Operator</h1>
<div align="center">
<a href="https://github.com/bailihuiyue/js-tree-operator/" target="_blank">像Jquery一样操作树级结构  </a>
</div>

码云地址: https://gitee.com/Onces/js-tree-operator

### 1.项目下载和运行

```javascript
1.npm install treeOperator
2.在项目中 import O, { globalConfig } from 'treeOperator'
```
### 2.API

| 方法名         | 说明                                    | 参数                                                         | 返回值                 | 链式调用     | 备注                         |
| -------------- | --------------------------------------- | :----------------------------------------------------------- | ---------------------- | ------------ | ---------------------------- |
| globalConfig   | 全局设置                                | { childrenName: 'children名称',<br /> pidName: '父id名称',<br /> primaryKeyName: '主键名称(必须唯一)' } | -                      | 否           |                              |
| setConfig      | 本次调用中单独配置                      | 同上                                                         | O<br />(O表示整体对象) | 是           |                              |
| getAll         | 获取所有匹配到的内容                    | 第二个参数{ useLike:true } 可以支持模糊搜索 | [{}]                   | 仅支持remove |                              |
| getFirst       | 获取第一个                              | 第二个参数{ useLike:true } 可以支持模糊搜索 | {}                     | 是           |                              |
| getByKeys | 根据字段批量获取节点 | keyName, arr, options,可以支持模糊搜索 | [] | 是 | keyName表示要查找的字段名,arr是key的数组,可以支持模糊搜索 |
| parent         | 直接父节点                              |                                                              | {}                     | 是           |                              |
| parents        | 所有父节点                              |                                                              | [{}]                   | 仅支持remove | 可以支持getAll后获取,本质为循环每一条,因此性能较低 |
| flat           | 拍平选中的树结构                        |                                                              | [{}]                   | 否           |                              |
| map            | 递归循环所有节点                        |                                                              | O                      | 是           |                              |
| next           | 获取找到节点的下一个                    |                                                              | {}                     | 是           |                              |
| nextAll        | 获取找到节点的下面所有的节点            |                                                              | []                     | 仅支持remove |                              |
| prev           | 获取找到节点的前一个                    |                                                              | {}                     | 是           |                              |
| prevAll        | 获取找到节点的前面所有的节点            |                                                              | []                     | 仅支持remove |                              |
| siblings       | 获取找到节点的兄弟节点                  |                                                              | []                     | 仅支持remove |                              |
| remove         | 删除节点                                |                                                              | O                      | 是           |                              |
| prepend        | 在找到的节点前添加节点                  | [{}]                                                         | 兄弟节点               |              | 可以添加多个                 |
| append         | 在找到的节点后添加节点                  | [{}]                                                         | 兄弟节点               |              | 可以添加多个                 |
| clone          | 深拷贝                                  | any                                                          | O                      | 是           |                              |
| listToTree     | 列表转树                                | 列表                                                         | 转成的树               | 是           | 必须定义根节点id             |
| treeToList     | 树转列表                                | 树                                                           | 列表                   | 否           |                              |
| siblingsLength | 获取找到节点的兄弟节点长度              | 节点                                                         | number                 | 否           |                              |
| toFieldArray   | 将找到节点的指定字段变为数组            | key:要转换的字段名                                           | []                     | 否           | 第二个参数表示是否包含子节点 |
| current        | 直接设定当前节点,然后以此为条件继续操作 | 节点                                                         | O                      | 是  ||


### 3.代码示例

```javascript
const data = [
  {
    id: 1,
    name: 1,
    key: 1,
    cd: [
      {
        id: 2,
        name: 2,
        key: 2,
        cd: [
          {
            id: 3,
            name: 3,
            key: 3,
            cd: [
              {
                id: 4,
                name: 4,
                key: 4
              }
            ]
          }
        ]
      },
      {
        id: 5,
        name: 5,
        key: 5,
        cd: [
          {
            id: 6,
            name: 6,
            key: 6
          },
          {
            id: 6,
            name: 7,
            key: 7
          },
          {
            id: 6,
            name: 8,
            key: 8
          }
        ]
      }
    ]
  },
  {
    id: 9,
    name: 9,
    key: 9
  },
  {
    id: 10,
    name: 10,
    key: 4
  }
]

//全局设置 { childrenName: 'children名称', pidName: '父id名称', primaryKeyName: '主键名称(必须唯一)' }
globalConfig({ childrenName: 'cd' })

// 使用setConfig在本次调用中单独设置
// getAll表示获取所有的相同内容
const result = O(data).setConfig({ childrenName: 'cd1' }).showConfig().getAll({ key: 6 }).result
console.log(result)

//获取第一个 第二个参数{ useLike:true } 可以支持模糊搜索
const result = O(data).getFirst({ key: 8 },{useLike:true}).result
console.log(result)

//获取所有匹配到的内容 第二个可选参数{ useLike:true } 可以支持模糊搜索,默认false
const result = O(data).getAll({ key: 8 },{useLike:true}).result
console.log(result)

//根据字段批量获取节点 可以支持模糊搜索
const result = O(res).getByKeys('id', ['xxx'], { useLike: true }).result
console.log(result)


// 直接父节点
const parent = O(data).getFirst({ key: 2 }).parent().result
console.log(parent)

//所有父节点
const parents = O(data).getFirst({ id: 4 }).parents().result
console.log(parents)

//拍平选中的树结构
const flat = O(data).getFirst({ key: 1 }).flat().result
console.log(flat)

// 递归循环所有节点
const map = O(data).map((item) => {
  item.a='123'
}).result
console.log(map);

//获取找到节点的下一个
const next = O(data).getFirst({ key: 9 }).next().result
console.log(next)

//获取找到节点的下面所有的节点
const nextAll = O(data).getFirst({ key: 7 }).nextAll().result
console.log(nextAll)

//获取找到节点的前一个
const prev = O(data).getFirst({ key: 8 }).prev().result
console.log(prev)

//获取找到节点的前面所有的节点
const prevAll = O(data).getFirst({ key: 8 }).prevAll().result
console.log(prevAll)

// 获取找到节点的兄弟节点
const siblings = O(data).getFirst({ key: 7 }).siblings().result
console.log(siblings)

// 删除节点
const d = O(data).getAll({ key: 4 }).result
const remove = O(data).remove(d).result
console.log(remove)

// 在找到的节点前添加节点(可以添加多个)
const prepend = O(data).getFirst({ key: 4 }).prepend([{key:11,id:11,a:111}]).result
console.log(prepend)

// 在找到的节点后添加节点(可以添加多个)
const append = O(data).getFirst({ key: 4 }).append([{key:11,id:11,a:111}]).result
console.log(append)

// 深拷贝
const clone = O(data).getAll({ key: 4 }).clone().result
console.log(clone)

const list = [
  { a: 1, b: 1, pid: 0, id: 1 },
  { a: 6, b: 6, pid: 0, id: 6 },
  { a: 7, b: 7, pid: 6, id: 7 },
  { a: 2, b: 2, pid: 1, id: 2 },
  { a: 3, b: 3, pid: 1, id: 3 },
  { a: 3, b: 3, pid: 2, id: 8 },
  { a: 4, b: 4, pid: 3, id: 4 },
  { a: 5, b: 5, pid: 4, id: 5 }
]

// 列表转树(必须定义根节点id,否则无法组成树)
const listToTree = O().listToTree(list, 0).result
console.log(listToTree)

// 树转列表
const treeToList = O(data).setConfig({ primaryKeyName: 'id' }).treeToList().result
console.log(treeToList)

// 互转测试
const listToTreeToList = O().setConfig({ pidName: 'parentId' }).listToTree(list, 0).treeToList().result
console.log(listToTreeToList)

// 获取找到节点的兄弟节点长度
const siblingsLength = O(data).getFirst({ id: 6 }).siblingsLength()
console.log(siblingsLength)

// 将找到节点的指定字段变为数组(第二个参数表示是否包含子节点)
const toFieldArray = O(data).getAll({ key: 2 }).toFieldArray('key', false)
console.log(toFieldArray)

// 直接设定当前节点,然后以此为条件继续操作
cosnt item = O(data).getFirst({ id: 6 }).result
const result = O(data).current(item).parent().result
```

## 兼容性

理论上支持所有js语言的东东,比如node,vue,react,html等,若有不支持的,请在rollup中自行配置打包条件

##### 落魄前端,在线要饭

<img src="https://i.imgtg.com/2023/03/22/9tzCN.jpg" width=200/>

下次一定?给个Star也行啊
