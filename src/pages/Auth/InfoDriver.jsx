import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const InfoDriver = () => {
  const [trucks, setTrucks] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTruck, setSelectedTruck] = useState(null); // ✅ truck hasil search
  const [error, setError] = useState(""); // ✅ pesan error kalau tidak ketemu

  // Ambil semua data truk
  const fetchTrucks = () => {
    fetch("http://localhost:5000/api/trucks")
      .then((res) => res.json())
      .then((data) => {
        setTrucks(data);
        setError("");
      })
      .catch((err) => console.error("Gagal mengambil data truck:", err));
  };

  // Search berdasarkan plate number
  const fetchTruckBySearch = (plateNumber) => {
    const encodedPlate = encodeURIComponent(plateNumber);
    fetch(`http://localhost:5000/api/trucks/search/${encodedPlate}`)
      .then((res) => {
        if (res.status === 404) {
          setSelectedTruck(null);
          setError("❌ Truck dengan plat nomor tersebut tidak ditemukan");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          setSelectedTruck(data[0]); // ✅ ambil hanya 1
          setError("");
        } else if (data) {
          setSelectedTruck(null);
          setError("❌ Truck tidak ditemukan");
        }
      })
      .catch((err) => {
        console.error("❌ Gagal mencari truck:", err);
        setError("⚠️ Terjadi kesalahan saat mencari truck");
      });
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim() === "") {
      setSelectedTruck(null);
      setError("");
      fetchTrucks();
    } else {
      fetchTruckBySearch(search.trim());
    }
  };

  // ✅ Kalau input search dikosongkan → tampilkan semua data lagi
  useEffect(() => {
    if (search.trim() === "") {
      setSelectedTruck(null);
      setError("");
      fetchTrucks();
    }
  }, [search]);

  return (
    <div
      className="flex min-h-screen bg-fixed bg-cover bg-center"
      style={{
        background: `linear-gradient(135deg, #43bfbf 0%, #076169 60%, #033c3b 100%)`,
      }}
    >
      {/* Sidebar */}
      <div className="bg-black bg-opacity-70 text-white w-64 p-6 flex flex-col justify-between">
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
            <div className="bg-gray-700 rounded-lg p-3 text-center hover:bg-gray-600 transition">
              <Link to="/master-data" className="block hover:text-white">
                Master Data
              </Link>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center hover:bg-gray-600 transition">
              <Link to="/tracking" className="block hover:text-white">
                Tracking
              </Link>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center hover:bg-gray-600 transition">
              <Link to="/checkpoint" className="block hover:text-white">
                Checkpoint
              </Link>
            </div>
            <div className="bg-blue-700 rounded-lg p-3 text-center hover:bg-blue-600 transition">
              <Link to="/info-driver" className="block hover:text-white">
                Info Driver
              </Link>
            </div>
          </div>
        </div>
        <div className="space-y-6 mt-6">
          <div className="bg-gray-700 rounded-lg p-3 text-center hover:bg-gray-600 transition">
            <Link to="/settings" className="block hover:text-white">
              Settings
            </Link>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center hover:bg-gray-600 transition">
            <Link to="/logout" className="block hover:text-white">
              Logout
            </Link>
          </div>
          <div className="bg-indigo-700 rounded-lg p-3 text-center hover:bg-indigo-600 transition">
            <Link to="/timbang-muat" className="block hover:text-white">
              Timbang Muat
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-white bg-opacity-80 rounded-tl-3xl shadow-inner m-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Info Driver</h1>

          {/* ✅ Search Form */}
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Cari berdasarkan Plat Nomor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-400 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700 transition"
            >
              Cari
            </button>
          </form>
        </div>

        {/* ✅ Error message */}
        {error && (
          <p className="text-center text-red-600 font-medium mb-4">{error}</p>
        )}

        {/* ✅ Jika ada selectedTruck, tampilkan hanya 1 */}
        {selectedTruck ? (
          <div className="bg-white shadow-lg rounded-lg p-4 max-w-md mx-auto">
            <img
              src={
                selectedTruck.image_url || "https://via.placeholder.com/300"
              }
              alt="Truck"
              className="w-full h-48 object-cover rounded mb-4"
            />
            <h2 className="text-lg font-semibold mb-1">
              Truck ID: {selectedTruck.truckId}
            </h2>
            <p className="text-sm mb-1">
              Tipe: <strong>{selectedTruck.truckType}</strong>
            </p>
            <p className="text-sm mb-1">Driver: {selectedTruck.driver}</p>
            <p className="text-sm mb-1">
              Plat Nomor: <strong>{selectedTruck.plateNumber || "-"}</strong>
            </p>
            <p className="text-sm mb-1">
              Status: <span className="italic">{selectedTruck.status}</span>
            </p>
            <p className="text-sm mb-3">
              Tanggal:{" "}
              {selectedTruck.date ? selectedTruck.date.split("T")[0] : ""}
            </p>

            <Link
              to={`/info-driver/${selectedTruck.truckId}`}
              className="text-blue-600 font-medium hover:underline"
            >
              Lihat lebih lengkap →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trucks.length === 0 ? (
              <p className="text-center text-gray-700 col-span-full">
                Tidak ada data truk yang tersedia.
              </p>
            ) : (
              trucks.map((truck) => (
                <div
                  key={truck.truckId}
                  className="bg-white shadow-lg rounded-lg p-4"
                >
                  <img
                    src={truck.image_url || "https://via.placeholder.com/300"}
                    alt="Truck"
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                  <h2 className="text-lg font-semibold mb-1">
                    Truck ID: {truck.truckId}
                  </h2>
                  <p className="text-sm mb-1">
                    Tipe: <strong>{truck.truckType}</strong>
                  </p>
                  <p className="text-sm mb-1">Driver: {truck.driver}</p>
                  <p className="text-sm mb-1">
                    Plat Nomor: <strong>{truck.plateNumber || "-"}</strong>
                  </p>
                  <p className="text-sm mb-1">
                    Status: <span className="italic">{truck.status}</span>
                  </p>
                  <p className="text-sm mb-3">
                    Tanggal: {truck.date ? truck.date.split("T")[0] : ""}
                  </p>

                  <Link
                    to={`/info-driver/${truck.truckId}`}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Lihat lebih lengkap →
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoDriver;
