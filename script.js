// ===============================
// MediFind Backend URL
// ===============================

const API_BASE_URL = "https://medifind-backend-hlgq.onrender.com";


// ===============================
// Search Medicine
// ===============================

function searchMedicine() {

    const medicineName =
        document.getElementById("medicineInput").value.trim();

    const result =
        document.getElementById("result");

    // Check empty search
    if (medicineName === "") {

        result.innerHTML = `
            <div class="result-card">
                <h3>⚠️ Please enter a medicine name</h3>
                <p>
                    Enter the name of the medicine you want to find.
                </p>
            </div>
        `;

        return;
    }

    // Loading message
    result.innerHTML = `
        <div class="result-card">
            <h3>🔎 Searching...</h3>
            <p>
                Checking medicine availability at pharmacies.
            </p>
        </div>
    `;

    // Call LIVE Spring Boot API
    const url =
        `${API_BASE_URL}/api/medicines/search?name=${encodeURIComponent(medicineName)}`;

    fetch(url)

        .then(response => {

            if (!response.ok) {
                throw new Error("Server error: " + response.status);
            }

            return response.json();
        })

        .then(medicines => {

            // Medicine not found
            if (medicines.length === 0) {

                result.innerHTML = `
                    <div class="result-card">
                        <h2>❌ Medicine Not Found</h2>

                        <p>
                            No pharmacy currently has
                            <strong>${medicineName}</strong>
                            in the database.
                        </p>

                        <p>
                            Try searching for another medicine.
                        </p>
                    </div>
                `;

                return;
            }

            // Clear previous results
            result.innerHTML = "";

            // Results heading
            result.innerHTML += `
                <div class="search-result-heading">

                    <h2>
                        💊 Search Results
                    </h2>

                    <p>
                        ${medicines.length}
                        pharmacy result(s) found for
                        <strong>${medicineName}</strong>
                    </p>

                </div>
            `;

            // Display every pharmacy
            medicines.forEach(medicine => {

                // Availability
                let availability;
                let availabilityClass;

                if (medicine.quantity > 0) {

                    availability = "🟢 Available";
                    availabilityClass = "available";

                } else {

                    availability = "🔴 Out of Stock";
                    availabilityClass = "out-of-stock";
                }

                // Safe values
                const price =
                    medicine.price != null
                        ? `₹${Number(medicine.price).toFixed(2)}`
                        : "Not available";

                const quantity =
                    medicine.quantity != null
                        ? medicine.quantity
                        : 0;

                const manufacturer =
                    medicine.manufacturer || "Not available";

                const pharmacy =
                    medicine.pharmacy || "Unknown Pharmacy";

                const location =
                    medicine.location || "Location not available";

                // Google Maps
                const mapsUrl =
                    "https://www.google.com/maps/search/?api=1&query=" +
                    encodeURIComponent(
                        pharmacy + " " + location
                    );

                // Create result card
                result.innerHTML += `
                    <div class="result-card">

                        <div class="result-icon">
                            💊
                        </div>

                        <h2>
                            ${medicine.name}
                        </h2>

                        <div class="medicine-details">

                            <p>
                                🏪
                                <strong>Pharmacy:</strong>
                                ${pharmacy}
                            </p>

                            <p>
                                📍
                                <strong>Location:</strong>
                                ${location}
                            </p>

                            <p>
                                💰
                                <strong>Price:</strong>
                                ${price}
                            </p>

                            <p>
                                📦
                                <strong>Stock:</strong>
                                ${quantity} unit(s)
                            </p>

                            <p>
                                🏭
                                <strong>Manufacturer:</strong>
                                ${manufacturer}
                            </p>

                            <p class="${availabilityClass}">
                                <strong>Status:</strong>
                                ${availability}
                            </p>

                        </div>

                        <a
                            href="${mapsUrl}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="dashboard-button"
                        >
                            📍 Get Directions
                        </a>

                    </div>
                `;
            });
        })

        .catch(error => {

            console.error("Medicine search error:", error);

            result.innerHTML = `
                <div class="result-card">

                    <h2>
                        ⚠️ Unable to Connect
                    </h2>

                    <p>
                        We couldn't connect to the MediFind server.
                    </p>

                    <p>
                        Please try again in a moment.
                    </p>

                </div>
            `;
        });
}


// ===============================
// Login - Send Email OTP
// ===============================

function sendOTP() {

    const contact =
        document.getElementById("loginContact");

    const selectedType =
        document.getElementById("userType").value;

    if (!contact) {

        alert("Login form not found.");
        return;
    }

    const email =
        contact.value.trim();

    if (email === "") {

        alert("Please enter your email address.");
        return;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        alert("Please enter a valid email address.");
        return;
    }

    // Convert login type to database role
    const role =
        selectedType === "customer"
            ? "USER"
            : "PHARMACIST";

    // LIVE Render backend
    const url =
        `${API_BASE_URL}/api/otp/send?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`;

    fetch(url, {
        method: "POST"
    })

    .then(response => response.text())

    .then(result => {

        if (result === "USER_NOT_FOUND") {

            alert("User not found. Please check your email address.");
            return;
        }

        if (result === "OTP_SENT") {

            localStorage.setItem("loginEmail", email);
            localStorage.setItem("userType", selectedType);

            alert("OTP sent to your email! 📧");

            window.location.href = "otp.html";

            return;
        }

        alert("Unable to send OTP. Please try again.");
    })

    .catch(error => {

        console.error("OTP error:", error);

        alert("Cannot connect to MediFind server.");
    });
}


// ===============================
// Resend Email OTP
// ===============================

function resendOTP() {

    const email =
        localStorage.getItem("loginEmail");

    const userType =
        localStorage.getItem("userType");

    if (!email || !userType) {

        alert("Login session not found. Please login again.");

        window.location.href = "login.html";

        return;
    }

    const role =
        userType === "customer"
            ? "USER"
            : "PHARMACIST";

    // LIVE Render backend
    const url =
        `${API_BASE_URL}/api/otp/send?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`;

    fetch(url, {
        method: "POST"
    })

    .then(response => response.text())

    .then(result => {

        if (result === "OTP_SENT") {

            alert("A new OTP has been sent to your email! 📧");

        }

        else if (result === "USER_NOT_FOUND") {

            alert("User not found. Please login again.");

        }

        else {

            alert("Unable to resend OTP. Please try again.");
        }
    })

    .catch(error => {

        console.error("Resend OTP error:", error);

        alert("Cannot connect to MediFind server.");
    });
}


// ===============================
// Verify Email OTP
// ===============================

function verifyOTP() {

    const otpInput =
        document.getElementById("otpInput");

    if (!otpInput) {

        alert("OTP input not found.");
        return;
    }

    const otp =
        otpInput.value.trim();

    const email =
        localStorage.getItem("loginEmail");

    const userType =
        localStorage.getItem("userType");

    if (!email || !userType) {

        alert("Login session not found. Please login again.");

        window.location.href = "login.html";

        return;
    }

    if (otp === "") {

        alert("Please enter the OTP.");
        return;
    }

    if (!/^\d{6}$/.test(otp)) {

        alert("Please enter a valid 6-digit OTP.");
        return;
    }

    // LIVE Render backend
    const url =
        `${API_BASE_URL}/api/otp/verify?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`;

    fetch(url, {
        method: "POST"
    })

    .then(response => response.text())

    .then(result => {

        if (result === "OTP_VERIFIED") {

            alert("OTP verified successfully! ✅");

            if (userType === "pharmacist") {

                window.location.href = "pharmacist.html";

            } else {

                window.location.href = "customer.html";
            }

            return;
        }

        if (result === "INVALID_OTP") {

            alert("Invalid OTP. Please try again.");
            return;
        }

        if (result === "OTP_EXPIRED") {

            alert("OTP has expired. Please login again.");

            window.location.href = "login.html";

            return;
        }

        if (result === "OTP_NOT_FOUND") {

            alert("OTP not found. Please request a new OTP.");

            return;
        }

        alert("OTP verification failed.");
    })

    .catch(error => {

        console.error("OTP verification error:", error);

        alert("Cannot connect to MediFind server.");
    });
}