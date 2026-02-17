export interface IPost {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: string;
}

export interface IPostView extends IPost {
  blogName: string;
}