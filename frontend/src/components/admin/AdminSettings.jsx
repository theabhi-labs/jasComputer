// AdminSettings.jsx
const AdminSettings = () => {
  const [admissionFee, setAdmissionFee] = useState(5000);
  const [loading, setLoading] = useState(false);
  
  const updateAdmissionFee = async () => {
    setLoading(true);
    try {
      await api.put('/admin/settings/admission-fee', { fee: admissionFee });
      alert('Admission fee updated successfully');
    } catch (error) {
      alert('Failed to update fee');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <div className="max-w-md">
        <label className="block text-sm font-medium mb-2">
          Admission Fee (₹)
        </label>
        <input
          type="number"
          value={admissionFee}
          onChange={(e) => setAdmissionFee(Number(e.target.value))}
          className="w-full px-3 py-2 border rounded-lg"
        />
        <Button
          onClick={updateAdmissionFee}
          isLoading={loading}
          className="mt-4"
        >
          Update Fee
        </Button>
      </div>
    </div>
  );
};