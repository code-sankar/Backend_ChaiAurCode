import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user Id");
  }

  const videoStats = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $project: {
        likesCount: {
          $size: "$likes",
        },
        viewsCount: "$views",
        totalVideos: 1,
      },
    },
    {
      $group: {
        _id: null,
        totalLikesCount: {
          $sum: "$likesCount",
        },
        totalViewsCount: {
          $sum: "$viewsCount",
        },
        totalVideos: {
          $sum: 1,
        },
      },
    },
  ]);

  const subscriberStats = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        subscriberCount: {
          $sum: 1,
        },
      },
    },
  ]);

  const tweetStats = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        tweetCount: {
          $sum: 1,
        },
      },
    },
  ]);

  if (!videoStats && subscriberStats && tweetStats) {
    throw new ApiError(500, "Failed to fetch channel data");
  }

  const stats = {
    subscriberCount: subscriberStats[0]?.subscriberCount || 0,
    totalLike: videoStats[0]?.totalLikesCount || 0,
    totalVideos: videoStats[0]?.totalVideos || 0,
    totalViews: videoStats[0]?.totalViewsCount || 0,
    totalTweets: tweetStats[0]?.tweetCount || 0,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched sucessfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const videos = await Video.aggregate([
    {
      $match: {
        owner: req.user?._id,
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $addFields: {
        commentsCount: {
          $size: "$comments",
        },
      },
    },
    {
      $project: {
        _id: 1,
        videoFile: 1,
        isPublished: 1,
        thumbnail: 1,
        likesCount: 1,
        commentsCount: 1,
        createdAt: 1,
        description: 1,
        title: 1,
        views: 1,
      },
    },
  ]);

  if (!videos) {
    throw new ApiError(404, "No video found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Video fetched successfully"));
});

export { getChannelStats, getChannelVideos };
