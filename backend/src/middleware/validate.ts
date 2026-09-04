import { Request, Response, NextFunction } from 'express';

export const validateCreateElection = (req: Request, res: Response, next: NextFunction): void => {
  const { title } = req.body || {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    res.status(400).json({
      success: false,
      message: 'Validation Error: title is required and must be a non-empty string'
    });
    return;
  }

  next();
};

export const validateAddCandidate = (req: Request, res: Response, next: NextFunction): void => {
  const { name } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({
      success: false,
      message: 'Validation Error: candidate name is required and must be a non-empty string'
    });
    return;
  }

  next();
};

export const validateCreateUser = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email } = req.body || {};

  const isValidEmail = typeof email === 'string' && email.includes('@') && email.trim().length > 3;

  if (!name || typeof name !== 'string' || !name.trim() || !isValidEmail) {
    res.status(400).json({
      success: false,
      message: 'Validation Error: name and a valid email address are required'
    });
    return;
  }

  next();
};

export const validateVoteTransaction = (req: Request, res: Response, next: NextFunction): void => {
  const { electionId, candidateId, transactionHash } = req.body || {};

  if (
    !electionId || typeof electionId !== 'string' || !electionId.trim() ||
    !candidateId || typeof candidateId !== 'string' || !candidateId.trim() ||
    !transactionHash || typeof transactionHash !== 'string' || !transactionHash.trim()
  ) {
    res.status(400).json({
      success: false,
      message: 'Validation Error: electionId, candidateId, and transactionHash are required non-empty strings'
    });
    return;
  }

  next();
};
