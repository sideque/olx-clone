import { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Login from "../Modal/Login";
import Sell from "../Modal/Sell";
import Footer from "../Footer/Footer";
import swal from "sweetalert";
import { UserAuth } from "../Context/Auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "../Firebase/Firebase";
import { ItemsContext } from "../Context/Item";

const emptyForm = { title: "", price: "", category: "", description: "" };

const MyAds = () => {
  const { user } = UserAuth();
  const itemsContext = ItemsContext();

  const [openModal, setModal] = useState(false);
  const [openModalSell, setModalSell] = useState(false);
  const toggleModal = () => setModal((prev) => !prev);
  const toggleModalSell = () => setModalSell((prev) => !prev);

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  const hasAds = ads.length > 0;

  const fetchUserAds = async () => {
    if (!user) {
      setLoading(false);
      setAds([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const productsQuery = query(
        collection(firestore, "products"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(productsQuery);
      const userAds = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setAds(userAds);
    } catch (err) {
      console.log(err);
      setError("Failed to load your ads. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const startEditing = (ad) => {
    setEditingId(ad.id);
    setEditForm({
      title: ad.title || "",
      price: ad.price || "",
      category: ad.category || "",
      description: ad.description || "",
    });
    setEditErrors({});
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(emptyForm);
    setEditErrors({});
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field]) {
      const message = validateEditField(field, value);
      setEditErrors((prev) => {
        const updated = { ...prev };
        if (message) {
          updated[field] = message;
        } else {
          delete updated[field];
        }
        return updated;
      });
    }
  };

  const validateEditField = (field, value) => {
    const trimmedValue = typeof value === "string" ? value.trim() : value ?? "";

    switch (field) {
      case "title":
        if (!trimmedValue) return "Title is required";
        if (trimmedValue.length < 3)
          return "Title must be at least 3 characters";
        return "";
      case "category":
        if (!trimmedValue) return "Category is required";
        return "";
      case "price":
        if (!trimmedValue) return "Price is required";
        if (isNaN(trimmedValue)) return "Price must be numeric";
        if (Number(trimmedValue) <= 0) return "Price must be greater than 0";
        return "";
      case "description":
        if (!trimmedValue) return "Description is required";
        if (trimmedValue.length < 10)
          return "Description must be at least 10 characters";
        return "";
      default:
        return "";
    }
  };

  const validateEditForm = () => {
    const fields = ["title", "category", "price", "description"];
    const collectedErrors = fields.reduce((acc, field) => {
      const message = validateEditField(field, editForm[field]);
      if (message) {
        acc[field] = message;
      }
      return acc;
    }, {});
    setEditErrors(collectedErrors);
    return Object.keys(collectedErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    if (!validateEditForm()) {
      return;
    }

    const trimmed = {
      title: editForm.title.trim(),
      price: editForm.price.toString().trim(),
      category: editForm.category.trim(),
      description: editForm.description.trim(),
    };

    setSaving(true);
    try {
      const docRef = doc(firestore, "products", editingId);
      await updateDoc(docRef, {
        title: trimmed.title,
        category: trimmed.category,
        price: Number(trimmed.price),
        description: trimmed.description,
      });

      setAds((prev) =>
        prev.map((ad) =>
          ad.id === editingId
            ? {
                ...ad,
                title: trimmed.title,
                category: trimmed.category,
                price: Number(trimmed.price),
                description: trimmed.description,
              }
            : ad
        )
      );

      cancelEditing();
    } catch (err) {
      console.log(err);
      alert("Failed to update the ad. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (adId) => {
    // const confirmed = window.confirm('Are you sure you want to delete this ad?');
    swal({
      title: "Are you sure ?",
      text: "Once deleted, you will not be able to recover this imaginary file!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((confirmed) => {
      if (confirmed) {
        swal("Your imaginary file has been deleted!", {
          icon: "success",
        });
      } else if (!confirmed) return;
      try {
        deleteDoc(doc(firestore, "products", adId));
        setAds((prev) => prev.filter((ad) => ad.id !== adId));
      } catch (err) {
        console.log(err);
        alert("Failed to delete the ad. Please try again.");
      }
    });
  };

  const renderContent = () => {
    if (!user) {
      return (
        <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
          <p className="text-lg text-gray-700">
            Login to view and manage your ads.
          </p>
          <button
            className="mt-4 px-6 py-2 rounded-md text-white"
            style={{ backgroundColor: "#002f34" }}
            onClick={toggleModal}
          >
            Login
          </button>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="text-center py-10 text-gray-600">Loading your ads…</div>
      );
    }

    if (error) {
      return <p className="text-center text-red-600 py-6">{error}</p>;
    }

    if (!hasAds) {
      return (
        <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
          <p className="text-lg text-gray-700">
            You have not posted any ads yet.
          </p>
          <button
            className="mt-4 px-6 py-2 rounded-md text-white"
            style={{ backgroundColor: "#002f34" }}
            onClick={toggleModalSell}
          >
            Sell an item
          </button>
        </div>
      );
    }

    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {ads.map((ad) => {
          const isEditing = editingId === ad.id;
          return (
            <div
              key={ad.id}
              className="w-full rounded-md border border-gray-200 bg-gray-50 overflow-hidden"
            >
              <div className="w-full h-48 bg-white flex items-center justify-center border-b border-gray-200">
                <img
                  src={ad.imageUrl || "https://via.placeholder.com/150"}
                  alt={ad.title}
                  className="h-40 object-contain"
                />
              </div>
              <div className="p-4 space-y-3">
                {isEditing ? (
                  <>
                    <div>
                      <input
                        className={`w-full border rounded-md p-2 focus:outline-none focus:border-teal-400 ${
                          editErrors.title
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        value={editForm.title}
                        onChange={(e) =>
                          handleEditChange("title", e.target.value)
                        }
                        placeholder="Title"
                      />
                      {editErrors.title && (
                        <p className="text-xs text-red-600 pt-1">
                          {editErrors.title}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        className={`w-full border rounded-md p-2 focus:outline-none focus:border-teal-400 ${
                          editErrors.category
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        value={editForm.category}
                        onChange={(e) =>
                          handleEditChange("category", e.target.value)
                        }
                        placeholder="Category"
                      />
                      {editErrors.category && (
                        <p className="text-xs text-red-600 pt-1">
                          {editErrors.category}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        className={`w-full border rounded-md p-2 focus:outline-none focus:border-teal-400 ${
                          editErrors.price
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        value={editForm.price}
                        onChange={(e) =>
                          handleEditChange("price", e.target.value)
                        }
                        placeholder="Price"
                      />
                      {editErrors.price && (
                        <p className="text-xs text-red-600 pt-1">
                          {editErrors.price}
                        </p>
                      )}
                    </div>
                    <div>
                      <textarea
                        className={`w-full border rounded-md p-2 focus:outline-none focus:border-teal-400 min-h-20 ${
                          editErrors.description
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        value={editForm.description}
                        onChange={(e) =>
                          handleEditChange("description", e.target.value)
                        }
                        placeholder="Description"
                      />
                      {editErrors.description && (
                        <p className="text-xs text-red-600 pt-1">
                          {editErrors.description}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3
                        className="text-xl font-bold"
                        style={{ color: "#002f34" }}
                      >
                        Rs {ad.price}
                      </h3>
                      <span className="text-xs uppercase tracking-wide text-gray-500">
                        {ad.category}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800">{ad.title}</p>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {ad.description}
                    </p>
                    {ad.createAt && (
                      <p className="text-xs text-gray-500">
                        Posted on {ad.createAt}
                      </p>
                    )}
                  </>
                )}

                <div className="flex items-center gap-2 pt-2">
                  {isEditing ? (
                    <>
                      <button
                        className="flex-1 rounded-md px-3 py-2 text-white"
                        style={{ backgroundColor: "#002f34" }}
                        onClick={handleUpdate}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        className="flex-1 rounded-md px-3 py-2 border border-gray-300 text-gray-600"
                        onClick={cancelEditing}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="flex-1 rounded-md px-3 py-2 border border-gray-300 text-gray-700"
                        onClick={() => startEditing(ad)}
                      >
                        Edit
                      </button>
                      <button
                        className="flex-1 rounded-md px-3 py-2 text-white"
                        style={{ backgroundColor: "#b3261e" }}
                        onClick={() => handleDelete(ad.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <Navbar toggleModal={toggleModal} toggleModalSell={toggleModalSell} />
      <Login toggleModal={toggleModal} status={openModal} />
      <Sell
        setItems={itemsContext?.setItems}
        toggleModalSell={toggleModalSell}
        status={openModalSell}
      />

      <section className="p-10 px-5 sm:px-10 lg:px-40 pt-28 min-h-screen bg-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#002f34" }}>
              My Ads
            </h1>
            <p className="text-gray-600 text-sm pt-1">
              Manage your listings in one place.
            </p>
          </div>
          {user && hasAds && (
            <p className="text-gray-500 text-sm">
              Showing <span className="font-semibold">{ads.length}</span> ads
            </p>
          )}
        </div>

        {renderContent()}
      </section>

      <Footer />
    </div>
  );
};

export default MyAds;
