export interface IBlog {
  name: string;
  description: string;
  websiteUrl: string;
  isMembership?: false;
  createdAt: string;
}

export interface IBlogViewModel extends IBlog {
  id: string;
}