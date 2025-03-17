# Arrivals Management System (Simplified)

This document outlines the functional requirements for the Arrivals Management System, a web application designed to streamline the processing of incoming shipments (arrivals) at the warehouse. This document serves as a guide for the developer and ensures all stakeholders have a shared understanding of the system's functionality.

The document covers the functionalities related to creating, managing, and processing arrivals, including manual product entry. It does _not_ include functionalities related to inventory management beyond the initial arrival processing.

## Definitions, Acronyms, and Abbreviations

- **Arrival:** A delivery of products to the warehouse, typically by truck.
- **tSKU:** Temporary Stock Keeping Unit, a unique identifier for a product generated automatically.
- **Barcode:** A machine-readable code representing product information.

## Overall Description

The Arrivals Management System should be a standalone project and will require new product and dropdown value tables in a new instance of Postgres database. It will serve as the primary tool to manage and process incoming shipments.

### Business Case

The purchase manager is responsible for acquiring incoming shipments based on an internal process that is not detailed within this document. Once a purchase is made, the manager obtains essential information about the shipment - including the supplier, expected arrival date, and available details regarding the contents (such as the number of pallets, boxes, pieces, total weight, or other metrics). This information is then used to create an arrival record in the system. Warehouse workers subsequently monitor the list of upcoming arrivals. When a truck arrives at the warehouse, workers verify and match the physical delivery with the corresponding arrival record. They then unload the shipment and manually enter product details into the system. This includes processing each item individually by recording information such as barcodes (if available), as well as attributes like brand, category, size, color, style, and condition. Once all products have been registered, the arrival is marked as finished and archived, with a summary comparing the expected quantities to the actual received quantities.

## Operating Environment

The application will be web-based and accessible through modern web browsers (Chrome, Firefox, Safari, Edge) on desktop computers and laptops used within the warehouse.

## Functional Requirements

- Create Arrival
- View Upcoming Arrivals
- View Finished Arrivals
- Edit Arrival
- Start Processing Arrival
- Continue Processing Arrival
- Finish Processing Arrival
- Process Products One by One (Manual Entry)

## Detailed Functional Requirements

| Feature                         | Description                                                                     | Inputs                                                                                                                                                                                      | Processing                                                                                                                                                  | Outputs                                                                                                                                                                                                                                         | Error Handling                                                                                                      | UI Considerations                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Create Arrival**              | Allows creation of a new arrival record.                                        | Expected Date (Date, mandatory), Supplier (Select, mandatory), Title (Text, mandatory), Pallets (Int, optional), Boxes (Int, optional), Kilograms (Float, optional), Pieces (Int, optional) | System generates a unique Arrival Number (a prefix with a sequential integer: ARR-001), validates inputs, and saves the new arrival record to the database. | Confirmation message and redirection to the Upcoming Arrivals list. Newly created arrival appears in the list, sorted by expected date.                                                                                                         | System displays error messages for invalid inputs (e.g., incorrect date format, non-integer values for quantities). | A modal or dedicated page for creating arrivals, with clearly labeled fields and input validation.                                  |
| **View Upcoming Arrivals**      | Displays a list of arrivals that are scheduled but not yet finished.            | None                                                                                                                                                                                        | Retrieves arrival data from the database, filters for upcoming arrivals (status not "finished"), and sorts by expected date ascending.                      | A list of upcoming arrivals displaying Expected Date, Arrival Number, Title, Supplier, and Expected quantities (Pallets, Boxes, Kilograms, Pieces). Provides buttons for "Start Processing," "Continue Processing" (if applicable), and "Edit." | Displays an error message if data retrieval fails.                                                                  | Clear table format, sorted by expected date, prominent action buttons.                                                              |
| **View Finished Arrivals**      | Displays a list of arrivals that have been completed.                           | None                                                                                                                                                                                        | Retrieves arrival data, filters for finished arrivals, and sorts by finished date descending (or other relevant criteria).                                  | A list of finished arrivals displaying Expected Date, Started Date, Finished Date, Arrival Number, Title, Supplier, Expected quantities, and Received quantities.                                                                               | Displays an error message if data retrieval fails.                                                                  | Clear table format.                                                                                                                 |
| **Edit Arrival**                | Allows modification of arrival details. (Only on upcoming/not started arrivals) | Arrival Number (disabled), Updated arrival data (Expected Date, Supplier, Title, Pallets, Boxes, Kilograms, Pieces).                                                                        | Validates input data, updates the arrival record in the database. Allowed only on upcoming arrivals that are not yet started.                               | Confirmation message and updated arrival information in the relevant list (Upcoming or Finished).                                                                                                                                               | Displays error messages for invalid input data, database errors.                                                    | Pre-populated form with existing data, clear validation rules.                                                                      |
| **Start Processing Arrival**    | Initiates the processing of an upcoming arrival.                                | Actual Received Pallets (int), Actual Received Boxes (int).                                                                                                                                 | Updates the arrival record with received quantities and sets the status to "in progress."                                                                   | Navigates to the "Process one by one".                                                                                                                                                                                                          | Displays error messages for invalid inputs.                                                                         | Clear input fields for received quantities.                                                                                         |
| **Continue Processing Arrival** | Resumes processing of a partially processed arrival.                            | None                                                                                                                                                                                        | Retrieves the current state of the arrival processing and navigates directly to the product processing screen.                                              | Navigates to the "Process Products" screen, bypassing initial input and method selection.                                                                                                                                                       | Displays error messages if arrival data retrieval fails.                                                            | Seamless transition to the appropriate processing step.                                                                             |
| **Finish Processing Arrival**   | Completes the arrival processing and updates its status.                        | Confirmation from the user.                                                                                                                                                                 | Updates arrival status to "finished," updates timestamps, and moves the arrival to the Finished Arrivals list.                                              | Displays expected vs. received quantities. Also lists all registered goods within this arrival.                                                                                                                                                 | Displays error messages if database update fails.                                                                   | Clear format, highlighting discrepancies between expected and received quantities, show a table with all goods within this arrival. |
| **Process Products One by One** | Allows manual entry of individual product details for an arrival.               | Barcode (optional), Brand, Category (mandatory), Size, Color, Style, Condition (mandatory), Quantity (mandatory, int).                                                                      | Validates inputs, creates/updates product records, and updates total received quantities for the arrival.                                                   | Adds the product to the arrival's registered goods list. If using a barcode, pre-fills fields for existing products.                                                                                                                            | Displays error messages for invalid inputs or barcode scans.                                                        | Dropdown fields for Brand, Category, Size, Color, Condition. Clear validation messages.                                             |

Here’s the clean markdown version of the use cases:

---

# **Use Cases**

## **Process Arrival Manually**

**Preconditions:**

- An upcoming arrival exists.

### **Flow of Events**

**Main Flow:**

1. User clicks **"Start Processing"** on an upcoming arrival.
2. User enters actual received **Pallets** and **Boxes**.
3. User clicks **"Next."**
4. User chooses **"Process one by one."**
5. User scans a barcode or selects **"No Barcode."**
6. If **no barcode**:
    - User enters product details:
        - **Brand**
        - **Category**
        - **Size**
        - **Color**
        - **Style**
        - **Condition**
        - **Quantity**
7. If **barcode exists and is new**:
    - User enters product details as above.
8. If **barcode exists and is already registered**:
    - User enters:
        - **Condition**
        - **Quantity**
9. User clicks **"Add."**
10. Steps 5-9 are repeated until all products are processed.
11. User clicks **"Finish Processing."**
12. Arrival is moved to the **Finished Arrivals** list.

**Alternate Flows:**

- User stays **IDLE** for a certain period of time (system saves progress).
- User closes browser without finishing (system saves progress).

**Postconditions:**

- Arrival is marked as **finished**.
- Product details are recorded.

**Exceptions:**

- **Invalid barcode scan**.
- **Database errors**.

---

## **Edit Arrival**

**Preconditions:**

- An **upcoming, not started** arrival exists.

### **Flow of Events**

**Main Flow:**

1. User navigates to the **Upcoming Arrivals** list.
2. User clicks the **"Edit"** button next to the target arrival.
3. System displays the **"Edit Arrival"** screen, pre-populated with existing arrival data.
4. User modifies **editable fields** (restrictions on editing arrival number field).
5. User clicks **"Save Changes."**
6. System validates the updated information.
7. System saves changes to the database.
8. System displays a **confirmation message**.

**Alternate Flows:**

- User clicks **"Cancel"** (no changes are saved).

**Postconditions:**

- Arrival information is **updated** in the database.

**Exceptions:**

- **Invalid input data**.
- **Database errors**.

---

## **Continue Processing Arrival**

**Preconditions:**

- An arrival exists and has been **previously started but not finished**.

### **Flow of Events**

**Main Flow:**

1. User navigates to the **Upcoming Arrivals** list.
2. User clicks **"Continue Processing"** on the target arrival.
3. System bypasses the initial information screen (pallets/boxes count) and processing method selection.
4. System directly navigates to the product processing screen (**"Process Products"**).
5. The flow continues as described in the **"Process Arrival Manually"** use case from **Step 5** onwards.

**Postconditions:**

- Processing of the arrival **continues from where it left off**.

**Exceptions:**

- **Database errors**.

---

## **View Upcoming/Finished Arrivals**

**Preconditions:**

- None.

### **Flow of Events**

**Main Flow:**

1. User navigates to the **"Arrivals"** section.
2. System displays two lists:
    - **Upcoming Arrivals**
    - **Finished Arrivals**
3. **Upcoming Arrivals** are sorted by **expected date**.
4. **Finished Arrivals** display:
    - **Expected date**
    - **Started date**
    - **Finished date**
    - **Received quantities**

**Postconditions:**

- **Arrivals lists** are displayed.

**Exceptions:**

- **Database errors**.

---

## **Finish Processing Arrival (Expanded)**

**Preconditions:**

- An arrival is currently being processed.

### **Flow of Events**

**Main Flow:**

1. User clicks **"Finish Processing."**
2. System calculates the **total received quantities** for all products associated with the arrival.
3. System compares **expected and received quantities**.
4. System displays the **expected vs. actual quantities** to the user.
5. User reviews the quantities and clicks **"Finish."**
6. System marks the arrival as **finished**, updating its **status** and **timestamps**.
7. System moves the arrival from the **Upcoming Arrivals** list to the **Finished Arrivals** list.

**Postconditions:**

- Arrival is marked as **finished**.

**Exceptions:**

- **Database errors**.

---
