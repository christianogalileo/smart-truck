import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const InfoDriverDetail = () => {
  const { truckId } = useParams();
  const [truck, setTruck] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [loadings, setLoadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch truck details + checkpoints
        const resTruck = await fetch(
          `/api/trucks/${encodeURIComponent(truckId)}/details`
        );
        if (!resTruck.ok) throw new Error("Gagal mengambil data truck");
        const data = await resTruck.json();
        setTruck(data.truck || null);

        // Urutkan checkpoint berdasarkan urutan angka
        const sortedCheckpoints = (data.checkpoints || []).sort((a, b) => {
          const numA = parseInt(a.checkpoint.replace(/\D/g, ""), 10) || 0;
          const numB = parseInt(b.checkpoint.replace(/\D/g, ""), 10) || 0;
          return numA - numB;
        });
        setCheckpoints(sortedCheckpoints);

        // Fetch loadings
        const resLoadings = await fetch(
          `/api/loadings/${encodeURIComponent(truckId)}`
        );
        if (!resLoadings.ok) throw new Error("Gagal mengambil data timbang muat");
        const loadingData = await resLoadings.json();
        setLoadings(loadingData || []);
      } catch (err) {
        setError(err.message || "Terjadi kesalahan saat mengambil data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [truckId]);

  // Export Excel untuk 1 truck
  const handleExportExcel = () => {
    if (truck?.truckId) {
      const url = `/api/export/truck/${encodeURIComponent(
        truck.truckId
      )}/excel`; // <-- pakai /excel
      window.open(url, "_blank");
    } else {
      alert("Data truck belum tersedia.");
    }
  };

  // Export PDF untuk 1 truck
  const handleExportPDF = () => {
    if (truck?.truckId) {
      const url = `/api/export/truck/${encodeURIComponent(
        truck.truckId
      )}/pdf`;
      window.open(url, "_blank");
    } else {
      alert("Data truck belum tersedia.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      {/* Sidebar */}
      <div className="bg-gray-800 text-white w-64 p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col items-center mb-6">
            <img
              src="/images/admin.png"
              alt="Admin Icon"
              className="rounded-full mb-2 w-16 h-16 object-cover"
            />
            <h2 className="font-semibold text-lg">Admin</h2>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <Link to="/master-data" className="block hover:text-white">
                Master Data
              </Link>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <Link to="/tracking" className="block hover:text-white">
                Tracking
              </Link>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <Link to="/info-driver" className="block hover:text-white">
                Info Driver
              </Link>
            </div>
          </div>
        </div>
        <div className="space-y-6 mt-6">
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <Link to="/settings" className="block hover:text-white">
              Settings
            </Link>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <Link to="/logout" className="block hover:text-white">
              Logout
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Detail Info Driver</h1>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : !truck ? (
          <p className="text-gray-600">Data truck tidak ditemukan.</p>
        ) : (
          <>
            {/* Truck Detail */}
            <div className="max-w-lg bg-white shadow-lg rounded-lg p-6 mx-auto mb-8">
              <img
                src={
                  truck.image_path
                    ? `http://38.147.122.240:5000/uploads/${truck.image_path}`
                    : "https://via.placeholder.com/300"
                }
                alt="Truck"
                className="w-full h-48 object-cover rounded mb-4"
              />
              <h2 className="text-lg font-semibold mb-2">
                Truck ID: {truck.truckId}
              </h2>
              <p className="mb-1">
                <strong>Plat Nomor:</strong> {truck.plateNumber || "-"}
              </p>
              <p className="mb-1">
                <strong>Tipe:</strong> {truck.truckType || "-"}
              </p>
              <p className="mb-1">
                <strong>Driver:</strong> {truck.driver || "-"}
              </p>
              <p className="mb-1">
                <strong>Tanggal:</strong>{" "}
                {truck.date ? truck.date.split("T")[0] : "-"}
              </p>
              <div className="mt-4">
                <button
                  onClick={handleExportExcel}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 mr-2"
                >
                  Export Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
                >
                  Export PDF
                </button>
                <Link
                  to="/info-driver"
                  className="inline-block ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
                >
                  Kembali
                </Link>
              </div>
            </div>

            {/* Checkpoint Logs */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Checkpoint Logs</h2>
              {checkpoints.length === 0 ? (
                <p>Belum ada checkpoint.</p>
              ) : (
                <table className="w-full table-auto border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 p-2">Checkpoint</th>
                      <th className="border border-gray-300 p-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkpoints.map((cp) => (
                      <tr key={cp.id}>
                        <td className="border border-gray-300 p-2">
                          {cp.checkpoint}
                        </td>
                        <td className="border border-gray-300 p-2">
                          {cp.timestamp
                            ? new Date(cp.timestamp).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Timbang Muat */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Data Timbang Muat</h2>
              {loadings.length === 0 ? (
                <p>Belum ada data timbang muat.</p>
              ) : (
                <table className="w-full table-auto border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 p-2">Item</th>
                      <th className="border border-gray-300 p-2">Quantity</th>
                      <th className="border border-gray-300 p-2">Bruto</th>
                      <th className="border border-gray-300 p-2">Tara</th>
                      <th className="border border-gray-300 p-2">Netto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadings.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-2">
                          {item.itemType || "-"}
                        </td>
                        <td className="border border-gray-300 p-2">
                          {item.quantity || 0}
                        </td>
                        <td className="border border-gray-300 p-2">
                          {item.bruto || 0}{" "}
                          <span className="text-gray-500 text-sm">
                            {item.unit || "Kg"}
                          </span>
                        </td>
                        <td className="border border-gray-300 p-2">
                          {item.tara || 0}{" "}
                          <span className="text-gray-500 text-sm">
                            {item.unit || "Kg"}
                          </span>
                        </td>
                        <td className="border border-gray-300 p-2">
                          {item.netto || 0}{" "}
                          <span className="text-gray-500 text-sm">
                            {item.unit || "Kg"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InfoDriverDetail;
