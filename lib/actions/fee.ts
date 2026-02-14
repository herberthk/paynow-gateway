"use server";

export const getTransactionFee = async (type: TransactionType) => {
  switch (type) {
    case "TRANSFER":
      return {
        success: true,
        amount: 200.0,
      };
    case "PAYMENT":
      return {
        success: true,
        amount: 0.0,
      };
    default:
      return {
        success: false,
        message: "Invalid transaction type",
      };
  }
};
