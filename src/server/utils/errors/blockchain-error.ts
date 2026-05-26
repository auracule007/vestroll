


export class BlockchainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}


export class AccountNotFoundError extends BlockchainError {
  constructor(
    message: string = "Account not found",
    originalError?: Error,
  ) {
    super(message, "account_not_found", originalError);
  }
}


export class InsufficientFundsError extends BlockchainError {
  constructor(
    message: string = "Insufficient funds",
    public readonly required?: string,
    public readonly available?: string,
    originalError?: Error,
  ) {
    super(
      required && available
        ? `${message}: required ${required}, available ${available}`
        : message,
      "insufficient_funds",
      originalError,
    );
  }
}


export class SimulationFailedError extends BlockchainError {
  constructor(
    message: string = "Transaction simulation failed",
    public readonly simulationError?: string,
    originalError?: Error,
  ) {
    super(message, "simulation_failed", originalError);
  }
}


export class TransactionRejectedError extends BlockchainError {
  constructor(
    message: string = "Transaction rejected",
    public readonly transactionHash?: string,
    public readonly rejectionReason?: string,
    originalError?: Error,
  ) {
    super(message, "transaction_rejected", originalError);
  }
}


export function wrapBlockchainError(error: unknown): BlockchainError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const originalError = error instanceof Error ? error : undefined;

  
  
  
  if (
    errorMessage.toLowerCase().includes("account not found") ||
    errorMessage.toLowerCase().includes("account does not exist") ||
    errorMessage.toLowerCase().includes("invalid account")
  ) {
    return new AccountNotFoundError(
      `Account not found: ${errorMessage}`,
      originalError,
    );
  }

  
  if (
    errorMessage.toLowerCase().includes("insufficient") ||
    errorMessage.toLowerCase().includes("not enough") ||
    errorMessage.toLowerCase().includes("balance too low")
  ) {
    return new InsufficientFundsError(
      `Insufficient funds: ${errorMessage}`,
      undefined,
      undefined,
      originalError,
    );
  }

  
  if (
    errorMessage.toLowerCase().includes("simulation") ||
    errorMessage.toLowerCase().includes("simulate") ||
    errorMessage.toLowerCase().includes("host function error")
  ) {
    return new SimulationFailedError(
      `Simulation failed: ${errorMessage}`,
      errorMessage,
      originalError,
    );
  }

  
  if (
    errorMessage.toLowerCase().includes("transaction") &&
    (errorMessage.toLowerCase().includes("rejected") ||
      errorMessage.toLowerCase().includes("failed") ||
      errorMessage.toLowerCase().includes("error"))
  ) {
    return new TransactionRejectedError(
      `Transaction rejected: ${errorMessage}`,
      undefined,
      errorMessage,
      originalError,
    );
  }

  
  return new BlockchainError(
    `Blockchain error: ${errorMessage}`,
    "blockchain_error",
    originalError,
  );
}