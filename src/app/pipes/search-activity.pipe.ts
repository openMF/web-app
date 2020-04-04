import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchActivity'
})
export class SearchActivityPipe implements PipeTransform {

  transform(activities: any, searchText: string): any {
    if(!activities) return [];

      if(!searchText) return []

        searchText = searchText.toLowerCase();
        if(searchText){
          document.getElementById('search_dropdown').removeAttribute('style');
        }
        else{
          document.getElementById('search_dropdown').setAttribute('style','display:none');
        }
        
        return activities.filter((activity:any)=>{
            return activity.activity.toLowerCase().includes(searchText);
        })
  }

}
