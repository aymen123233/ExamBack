import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { VotesService } from '../services';

export class VoteController {
  private votesService: VotesService;

  constructor(votesService: VotesService) {
    this.votesService = votesService;
  }

 // VoteController.ts
 async vote(request: Request, response: Response): Promise<void> {
  const { id } = request.params; // ID of the target (post or comment)
  const { voteType } = request.body;
  const userId = request.userId; // Ensure this is set by your auth middleware

  // Validate voteType and userId
  if (!['upvote', 'downvote'].includes(voteType)) {
    response.status(400).json({
      status: 400,
      message: 'Invalid vote type. Must be "upvote" or "downvote".',
    });
    return;
  }

  if (!userId) {
    response.status(401).json({
      status: 401,
      message: 'User not authenticated.',
    });
    return;
  }

  const targetType = request.path.includes('/posts/') ? 'post' : 'comment';

  try {
    const voteResponse = await this.votesService.castVote({
      userId,
      targetId: id,
      targetType,
      voteType,
    });

    response.status(voteResponse.status).json(voteResponse);
  } catch (error) {
    console.error("Error casting vote:", error);
    response.status(500).json({
      status: 500,
      message: 'Internal server error',
    });
  }
}

}
