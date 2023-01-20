import {Injectable} from '@angular/core';


@Injectable({
  providedIn: 'root'
})

export class OUHierarchy {

    flatToHierarchy(flat: any, data: any) {
        const roots = [];
        const all = {};
        data.forEach(function (item: any) {
          all[item.id] = item;
        });

        Object.keys(all).forEach(function (id: any) {
          const item = all[id];
          const displayName = item?.name;
          item.name = displayName;
          if (!item.parentId || item.parentId === null) {
            roots.push(item);
          } else if (item.parentId in all) {
            const displayName = item.name;
            item.name = displayName;
            const p = all[item.parentId];
            if (!('children' in p)) {
              p.children = [];
            }
            if (flat.filter((x) => x.id === item.id)?.length > 0) {
              p.children.push(item);
            }
            if (!flat) {
              p.children.push(item);
            }
          } else {
            roots.push(item);
          }
        });
        return roots;
      }
}
