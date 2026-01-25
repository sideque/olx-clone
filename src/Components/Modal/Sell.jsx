import { Modal, ModalBody } from "flowbite-react";
import React, { useState } from "react";
import Input from "../Input/Input";
import { UserAuth } from "../Context/Auth";
import { addDoc, collection } from "firebase/firestore";
import { fetchFromFirestore, firestore } from "../Firebase/Firebase";
import close from "../../assets/close.svg";
import fileUpload from "../../assets/fileUpload.svg";
import loading from "../../assets/loading.gif";

const Sell = (props) => {
  const { toggleModalSell, status, setItems } = props;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);

  const auth = UserAuth();

  const setFieldError = (field, message) => {
    setErrors((prev) => {
      const updated = { ...prev };
      if (message) {
        updated[field] = message;
      } else {
        delete updated[field];
      }
      return updated;
    });
  };

  const validateField = (field, value) => {
    const trimmedValue =
      typeof value === "string" ? value.trim() : (value ?? "");

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
        if (isNaN(trimmedValue)) return "Price must be a number";
        if (Number(trimmedValue) <= 0) return "Price must be greater than 0";
        return "";
      case "description":
        if (!trimmedValue) return "Description is required";
        if (trimmedValue.length < 10)
          return "Description should be at least 10 characters";
        return "";
      case "image":
        if (!value) return "Product image is required";
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (field, value) => {
    const message = validateField(field, value);
    setFieldError(field, message);
  };

  const handleImageUpload = (event) => {
    if (event.target.files) {
      const file = event.target.files[0];
      const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml"];

      if (!allowedTypes.includes(file.type)) {
        alert("Only JPG, PNG, SVG files are allowed");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }

      setImage(file);
      setFieldError("image", "");
    }
  };

  const validateForm = () => {
    const newErrors = {
      title: validateField("title", title),
      category: validateField("category", category),
      price: validateField("price", price),
      description: validateField("description", description),
      image: validateField("image", image),
    };

    const filteredErrors = Object.entries(newErrors).reduce(
      (acc, [field, message]) => {
        if (message) {
          acc[field] = message;
        }
        return acc;
      },
      {},
    );

    setErrors(filteredErrors);

    return Object.keys(filteredErrors).length === 0;
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setPrice("");
    setDescription("");
    setImage(null);
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!auth?.user) {
      alert("login to continue");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    // converting image file to data url
    const readImageAsDataUrl = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageUrl = reader.result;
          localStorage.setItem(`image_${file.name}`, imageUrl);
          resolve(imageUrl);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    let imageUrl = "";
    if (image) {
      try {
        imageUrl = await readImageAsDataUrl(image);
      } catch (error) {
        alert("failed to read image");
        setSubmitting(false);
        return;
      }
    }

    const trimmedTitle = title.trim();
    const trimmedCategory = category.trim();
    const trimmedPrice = price.trim();
    const trimmedDescription = description.trim();

    try {
      await addDoc(collection(firestore, "products"), {
        title: trimmedTitle,
        category: trimmedCategory,
        price: Number(trimmedPrice),
        description: trimmedDescription,
        imageUrl,
        userId: auth.user.uid,
        userName: auth.user.displayName || "Anonymous",
        createAt: new Date().toDateString(),
      });

      resetForm();
      const datas = await fetchFromFirestore();
      setItems(datas);
      toggleModalSell();
    } catch (error) {
      console.log(error);
      alert("failed to add items to the firestore");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Modal
        theme={{
          content: {
            base: "relative w-full p-4 md:h auto",
            inner:
              "relative flex max-h-[90dvh] flex-col rounded-lg bg-white shadow:bg-gray-700",
          },
        }}
        onClick={toggleModalSell}
        show={status}
        className="bg-black"
        position={"center"}
        size="md"
        popup={true}
      >
        <ModalBody
          className="bg-white h-96 p-0 rounded-md"
          onClick={(event) => event.stopPropagation()}
        >
          <img
            src={close}
            className="w-6 absolute z-10 top-6 right-8 cursor-pointer"
            onClick={() => {
              toggleModalSell();
              setImage(null);
            }}
            alt=""
          />

          <div className="p-6 pl-8 pr-8 pb-8">
            <p className="font-bold text-lg mb-3">Sell Item</p>

            <form onSubmit={handleSubmit}>
              <Input
                name="title"
                value={title}
                setInput={(value) => {
                  setTitle(value);
                  if (errors.title) {
                    handleBlur("title", value);
                  }
                }}
                placeholder="Title"
                error={errors.title}
                onBlur={() => handleBlur("title", title)}
              />
              <Input
                name="category"
                value={category}
                setInput={(value) => {
                  setCategory(value);
                  if (errors.category) {
                    handleBlur("category", value);
                  }
                }}
                placeholder="Category"
                error={errors.category}
                onBlur={() => handleBlur("category", category)}
              />
              <Input
                name="price"
                type="number"
                value={price}
                setInput={(value) => {
                  setPrice(value);
                  if (errors.price) {
                    handleBlur("price", value);
                  }
                }}
                placeholder="Price"
                error={errors.price}
                onBlur={() => handleBlur("price", price)}
              />
              <Input
                name="description"
                value={description}
                setInput={(value) => {
                  setDescription(value);
                  if (errors.description) {
                    handleBlur("description", value);
                  }
                }}
                placeholder="Description"
                error={errors.description}
                onBlur={() => handleBlur("description", description)}
              />

              {/* conditional rendering */}

              <div className="pt-2 w-full relative">
                {image ? (
                  <div className="relative h-40 sm:h-60 w-full flex justify-center border-2 border-black border-solid rounded-md overflow-hidden">
                    <img
                      className="object-contain"
                      src={URL.createObjectURL(image)}
                      alt=""
                    />
                  </div>
                ) : (
                  <div className="relative h-40 sm:h-60 w-full border-2 border-black border-solid rounded-md">
                    <input
                      onChange={handleImageUpload}
                      type="file"
                      className="absolute inset-10 h-full w-full opacity-0 cursor-pointer z-30"
                    />

                    <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex flex-col items-center">
                      <img className="w-12" src={fileUpload} alt="" />
                      <p className="text-center text-sm pt-2">
                        Click to upload images
                      </p>
                      <p className="text-center text-sm pt-2">SVG, PNG, JPG</p>
                    </div>
                  </div>
                )}
              </div>
              {errors.image && (
                <p className="text-xs text-red-600 pt-1 pl-1">{errors.image}</p>
              )}

              {submitting ? (
                <div className="w-full flex h-14 justify-center pt-4 pb-2">
                  <img className="w-32 object-cover" src={loading} alt="" />
                </div>
              ) : (
                <div className="w-full pt-2">
                  <button
                    className="w-full p-3 rounded-lg text-white"
                    style={{ backgroundColor: "#002f34" }}
                  >
                    {" "}
                    Sell Item{" "}
                  </button>
                </div>
              )}
            </form>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default Sell;
