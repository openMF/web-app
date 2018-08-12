/** Self Service User model. */
export interface User {
  id: number;
  name: string;
  email: string;
  isSelfServiceUser: boolean;
  officeName: string;
  staff: string;
}
