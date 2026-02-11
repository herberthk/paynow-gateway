"use server";

export const getTransactionFee = async (type: TransactionType) => {
  switch (type) {
    case "TRANSFER":
      return 200.0;
    case "PAYMENT":
      return 0.0;
    default:
      return 0;
  }
};
