<script>
  const form = document.getElementById("donation-form");
  const message = document.getElementById("form-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "Uploading image...";

    // Collect form data
    const name = document.getElementById("name").value;
    const category = document.getElementById("category").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const story = document.getElementById("story").value;
    const imageFile = document.getElementById("image").files[0];

    if (!imageFile) {
      message.textContent = "❌ Please select an image.";
      message.style.color = "red";
      return;
    }

    // Unique image file name
    const filename = `${Date.now()}-${imageFile.name}`;

    try {
      // Upload image to Supabase Storage (this step may happen on your server)
      const uploadResponse = await uploadImageToSupabase(filename, imageFile);
      if (!uploadResponse.success) {
        message.textContent = "❌ Image upload failed: " + uploadResponse.error;
        message.style.color = "red";
        return;
      }

      // Save donation profile to database (this happens securely on your server)
      const saveProfileResponse = await saveDonationProfile({
        name,
        category,
        amount,
        story,
        imageUrl: uploadResponse.publicUrl,
      });

      if (saveProfileResponse.success) {
        message.textContent = "✅ Profile added successfully!";
        message.style.color = "green";
        form.reset();
      } else {
        message.textContent = "❌ Error adding profile: " + saveProfileResponse.error;
        message.style.color = "red";
      }
    } catch (error) {
      message.textContent = "❌ Error: " + error.message;
      message.style.color = "red";
    }
  });

  async function uploadImageToSupabase(filename, imageFile) {
    // Your backend server should handle the upload securely (supabase_key hidden)
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("filename", filename);

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });
    return await response.json();
  }

  async function saveDonationProfile(data) {
    // Send the profile data securely to your server
    const response = await fetch("/api/donate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  }
</script>
