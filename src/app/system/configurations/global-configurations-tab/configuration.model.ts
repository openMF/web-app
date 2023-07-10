/**
 * Global Configuration model.
 */
export interface GlobalConfiguration {
  id: number;
  name: string;
  enabled: boolean;
  value: any;
  trapDoor: boolean;

  description?: string;
  stringValue?: string;
  dateValue?: string;
}
