export interface IComment {
  content: string;
  commentatorInfo: ICommentatorInfo;
  createdAt: string;
}

export interface ICommentatorInfo {
  userId: string;
  userLogin: string
}

export interface ICommentViewModel extends IComment {
  id: string;
}

export interface ICommentByPost extends IComment {
  postId?: string;
}