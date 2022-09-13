import { Component, Input, OnInit } from '@angular/core';
import { DagreNodesOnlyLayout, Edge, Layout, Node } from '@swimlane/ngx-graph';
import * as shape from 'd3-shape';
import { Subject } from 'rxjs';


export class JobStep {
  id: number;
  stepName: string;
  order: number;
}

@Component({
  selector: 'mifosx-workflow-diagram',
  templateUrl: './workflow-diagram.component.html',
  styleUrls: ['./workflow-diagram.component.scss']
})
export class WorkflowDiagramComponent implements OnInit {
  @Input() jobStepsData: JobStep[] = [];

  diagramSize: [number, number] = [1024, 300];
  public nodes: Node[] = [];
  public links: Edge[] = [];
  public layoutSettings = {
    orientation: 'LR'
  };
  public curve: any = shape.curveLinear;
  public layout: Layout = new DagreNodesOnlyLayout();
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C']
  };
  center$ = new Subject<any>();

  constructor() { }

  ngOnInit(): void {
    let nodeCounter = 0;
    for (const jobStep of this.jobStepsData) {
      const currentNode = `node_${jobStep.order}`;
      const node: Node = {
        id: currentNode,
        label: jobStep.stepName,
        data: {
          name: jobStep.stepName,
          order: jobStep.order
        }
      };
      this.nodes.push(node);

      if (nodeCounter > 0) {
        const edge: Edge = {
          id: `link_${(jobStep.id)}`,
          source: `node_${(jobStep.order - 1)}`,
          target: currentNode,
          label: '',
          data: {
            linkText: 'Precedes of'
          }
        };

        this.links.push(edge);
      }

      nodeCounter++;
    }
    // trigger center
    this.center$.next();
  }

  public getStyles(node: Node): any {
      return 'node_odd';
  }

}
