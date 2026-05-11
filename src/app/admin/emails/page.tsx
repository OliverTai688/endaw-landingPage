import EmailManager from "@/components/admin/EmailManager";

export default function AdminEmailsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-white">郵件管理</h1>
        <p className="text-sm text-gray-500 mt-1">編輯報名確認信件範本，並查看寄送紀錄</p>
      </div>
      <EmailManager />
    </div>
  );
}
