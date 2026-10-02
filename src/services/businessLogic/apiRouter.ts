// RESTful /api/v1 Facade Router for Business Logic Integration

import { PostBusinessService } from './services/postService';
import { CommentBusinessService } from './services/commentService';
import { ReactionBusinessService } from './services/reactionService';
import { FriendBusinessService } from './services/friendService';
import { FollowBusinessService } from './services/followService';
import { ShareBusinessService } from './services/shareService';
import { BlockBusinessService } from './services/blockService';
import { FeedBusinessService } from './services/feedService';
import { BookmarkBusinessService } from './services/bookmarkService';
import { ActivityBusinessService } from './services/activityService';
import { ReportBusinessService } from './services/reportService';
import { AuthBusinessService } from './services/authService';

export const AddaBusinessApi = {
  // /api/v1/posts
  posts: {
    create: PostBusinessService.createPost,
    update: PostBusinessService.updatePost,
    delete: PostBusinessService.deletePost
  },

  // /api/v1/comments
  comments: {
    add: CommentBusinessService.addComment,
    delete: CommentBusinessService.deleteComment
  },

  // /api/v1/reactions
  reactions: {
    toggle: ReactionBusinessService.toggleReaction
  },

  // /api/v1/friends
  friends: {
    sendRequest: FriendBusinessService.sendFriendRequest,
    acceptRequest: FriendBusinessService.acceptFriendRequest,
    cancelOrReject: FriendBusinessService.cancelOrRejectRequest,
    unfriend: FriendBusinessService.unfriend
  },

  // /api/v1/follows
  follows: {
    follow: FollowBusinessService.followUser,
    unfollow: FollowBusinessService.unfollowUser
  },

  // /api/v1/shares
  shares: {
    share: ShareBusinessService.sharePost
  },

  // /api/v1/blocks
  blocks: {
    block: BlockBusinessService.blockUser,
    unblock: BlockBusinessService.unblockUser
  },

  // /api/v1/feed
  feed: {
    getFeed: FeedBusinessService.getFeedPosts
  },

  // /api/v1/bookmarks
  bookmarks: {
    toggleSave: BookmarkBusinessService.toggleSavePost,
    getSaved: BookmarkBusinessService.getUserSavedPosts
  },

  // /api/v1/activities
  activities: {
    getUserActivities: ActivityBusinessService.getUserActivities
  },

  // /api/v1/reports
  reports: {
    submit: ReportBusinessService.submitReport
  },

  // /api/v1/auth & users
  users: {
    syncProfile: AuthBusinessService.syncUserProfile,
    updateProfile: AuthBusinessService.updateProfile
  }
};
