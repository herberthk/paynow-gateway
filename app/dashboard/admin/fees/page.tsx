import AdminFeeManagement from "@/components/admin/AdminFeeManagement";
import { getAllTransactionFees } from "@/lib/actions/fee";

const Settings = async () => {
  const fees = await getAllTransactionFees();
  return <AdminFeeManagement fees={fees} />;
};

export default Settings;
