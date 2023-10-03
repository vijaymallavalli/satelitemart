// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// function Report() {
//   const [selectedDate, setSelectedDate] = useState('');
//   const [tableData, setTableData] = useState([]);
//   const [error, setError] = useState(null);

//   const handleDateChange = (event) => {
//     setSelectedDate(event.target.value);
//   };

//   const fetchData = async () => {
//     try {
//       const response = await axios.get(`http://localhost:8800/api/products/getProducts`,{
//         withCredentials: true,
//         params: { date: selectedDate },
//       });
//       setTableData(response.data);
//       setError(null); // Clear any previous errors
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setError('Error fetching data. Please try again.'); // Set an error message
//     }
//   };

//   useEffect(() => {
//     // Optionally, you can automatically fetch data when a date is selected
//     if (selectedDate) {
//       fetchData();
//     }
//   }, [selectedDate]);

//   return (
//     <div>
//       <h2>Stock Data By Date</h2>
//       <label htmlFor="datePicker">Select Date:</label>
//       <input
//         type="date"
//         id="datePicker"
//         value={selectedDate}
//         onChange={handleDateChange}
//       />
//       {/* <button onClick={fetchData}>Fetch Data</button> */}
//       {error && <p className="error">{error}</p>}
//       {tableData.length === 0 ? (
//         <p>No data available.</p>
//       ) : (
//         <table className="table table-bordered">
//           <thead>
//             <tr className="bg-secondary text-white">
//               <th>Product ID</th>
//               <th>Name</th>
//               <th>Quantity</th>
//               <th>Price</th>
//             </tr>
//           </thead>
//           <tbody>
//             {tableData.map((item) => (
//               <tr key={item.id}>
//                 <td>{item.s_no}</td>
//                 <td>{item.name}</td>
//                 <td>{item.quantity}</td>
//                 <td>{item.price}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }

// export default Report;

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/authContext";

function Report() {
  const [selectedDate, setSelectedDate] = useState("");
  const [tableData, setTableData] = useState([]);
  const [originalTableData, setOriginalTableData] = useState([]);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const [displayedDate, setDisplayedDate] = useState("");


  const id = currentUser.id;
  console.log(id);
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8800/api/products/getProducts`,
        {
          withCredentials: true,
          params: { date: selectedDate },
        }
      );
      setTableData(response.data);
      setOriginalTableData(response.data); // Store the original data for comparison
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data. Please try again."); // Set an error message
    }
  };

  useEffect(() => {
    // Optionally, you can automatically fetch data when a date is selected
    if (selectedDate) {
      fetchData();
    }
    setDisplayedDate(selectedDate);

  }, [selectedDate]);

  const toggleEditMode = () => {
    setIsEditMode((prevMode) => !prevMode);
  };

  const handleInputChange = (event, id, field) => {
    // Update the edited data in the tableData state
    const updatedTableData = tableData.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: event.target.value };
      }
      return item;
    });

    setTableData(updatedTableData);

  };

  const handleSaveClick = async () => {
    try {
      const currentDate = new Date(); // Get the current date and time

      // Extract only the date portion (YYYY-MM-DD)
      const currentDateOnly = currentDate.toISOString().split("T")[0];

      console.log(currentDate);
      // Assuming item.enter_date is a string in the format "YYYY-MM-DDTHH:mm:ss.sssZ"

      // Now, formattedDate will be in the format "MM/DD/YYYY"

      // Prepare an array of updated rows (price or quantity changed)
      const updatedRows = tableData.filter((item, index) => {
        return (
          item.price !== originalTableData[index].price ||
          item.quantity !== originalTableData[index].quantity
        );
      });

      // Send API requests to update the rows with changed data, including the current date
      await Promise.all(
        updatedRows.map(async (item) => {
          await axios.put(
            `http://localhost:8800/api/products/updateProducts/${item.id}`,
            {
              price: item.price,
              quantity: item.quantity,
              editedBy_id: id,
              modified_date: currentDateOnly, // Use the date-only value
            },
            {
              withCredentials: true,
            }
          );
        })
      );

      // Fetch the updated data from the backend after saving
      await fetchData(); // Fetch the updated data here

      // Exit "edit" mode after saving
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating data:", error);
      // Handle error, e.g., show an error message to the user
    }
  };

  return (
    <div>
      <h2>Stock Data By Date</h2>
      <label htmlFor="datePicker">Select Date:</label>
      <input
        type="date"
        id="datePicker"
        value={selectedDate}
        onChange={handleDateChange}
      />
      <div>
        {/* Display the selected date */}
        {displayedDate && (
          <p>Selected Date: {new Date(displayedDate).toLocaleDateString()}</p>
        )}
      </div>
      <button onClick={toggleEditMode}>
        {isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
      </button>
      {error && <p className="error">{error}</p>}
      {tableData.length === 0 ? (
        <p>No data available.</p>
      ) : (
        <div>
          <table className="table table-bordered">
            <thead>
              <tr className="bg-secondary text-white">
                <th>Product ID</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>Price</th>
                {/* <th>Date</th> */}
                <th>Enterd By</th>
                <th>Edited By</th>
                <th>Modified Date</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item) => (
                <tr key={item.id}>
                  <td>{item.s_no}</td>
                  <td>{item.name}</td>
                  <td>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) =>
                          handleInputChange(e, item.id, "quantity")
                        }
                      />
                    ) : (
                      item.quantity
                    )}
                  </td>
                  <td>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={item.price}
                        onChange={(e) => handleInputChange(e, item.id, "price")}
                      />
                    ) : (
                      item.price
                    )}
                  </td>
                  {/* <td>
                    {new Date(item.enter_date).toLocaleDateString()}{" "}
                  </td> */}
                  <td>{item.enteredBy}</td>
                  <td>
  {item.editedBy !== null ? item.editedBy : 'Not Edited'}
</td>


                  <td>
                    {item.modified_date
                      ? new Date(item.modified_date).toLocaleDateString()
                      : "Not modified"}
                    {/* Display date according to local timezone */}
                  </td>
                  {/* <td>{item.editedBy_id}</td> */}

                </tr>
              ))}
            </tbody>
          </table>
          {isEditMode && <button onClick={handleSaveClick}>Save</button>}
        </div>
      )}
    </div>
  );
}

export default Report;
