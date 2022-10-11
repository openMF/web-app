 export default class DataFlattner {
    public static flatToHierarchy(list: any) {
        let map = {},
          node,
          roots = [],
          i;

        for (i = 0; i < list.length; i += 1) {
          map[list[i].id] = i; // initialize the map
          list[i].children = []; // initialize the children
        }

        for (i = 0; i < list.length; i += 1) {
          node = list[i];
          if (node.parentId !== 1) {
            // if you have dangling branches check that map[node.parentId] exists
            list[map[node.parentId]].children.push(node);
          } else {
            roots.push(node);
          }
        }
        return roots;
      }
}
