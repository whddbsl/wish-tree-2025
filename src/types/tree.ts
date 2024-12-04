export interface Tree {
  id: string;
  userId: string;
  customization: {
    style: string;
    color: string;
    decorations: string[];
  };
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  treeId: string;
  content: string;
  isAnonymous: boolean;
  authorName?: string;
  createdAt: Date;
}
