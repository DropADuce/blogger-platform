export interface IPost {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: string;
}

export interface IPostWithBlogName extends IPost {
  blogName: string;
}