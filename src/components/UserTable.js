// components/UserTable.js
import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faSave } from '@fortawesome/free-solid-svg-icons';
import './UserTable.css';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 15;

  // Fetch user data from the API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
        const data = await response.json();
        setUsers(data.map(user => ({ ...user, isEditing: false, editedFields: {} })));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

//   Filtered and paginated users based on search term and current page
  const filteredUsers = useMemo(() => {
    const filtered = users.filter(user =>
      Object.values(user).some(
        value =>
          typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIdx = startIdx + ITEMS_PER_PAGE;
    return filtered.slice(startIdx, endIdx);
  }, [users, searchTerm, currentPage]);
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handlePageChange = page => {
    const newPage = Math.max(1, Math.min(page, totalPages)); // Ensure the newPage is between 1 and totalPages
    setCurrentPage(newPage);
  };
  

  const handleCheckboxChange = userId => {
    setSelectedRows(prevSelectedRows => {
      if (prevSelectedRows.includes(userId)) {
        return prevSelectedRows.filter(id => id !== userId);
      } else {
        return [...prevSelectedRows, userId];
      }
    });
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      alert("No rows selected. Please select rows to delete.");
      return;
    }
    setUsers(prevUsers => prevUsers.filter(user => !selectedRows.includes(user.id)));
    setSelectedRows([]);
    alert("Selected rows will be deleted!!");
  };

  const handleEdit = userId => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, isEditing: true } : { ...user, isEditing: false }
      )
    );
  };

  const handleSave = userId => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, isEditing: false, ...user.editedFields }
          : user
      )
    );
  };

  const handleDelete = userId => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    setSelectedRows([]);
    alert("This Row will be deleted!!.");
  };

  const handleSelectAll = () => {
    setSelectedRows(users.map(user => user.id));
  };

  const handleInputChange = (userId, field, value) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, editedFields: { ...user.editedFields, [field]: value } } : user
      )
    );
  };

  return (
    <div className="user-table">
      <div className="header">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-icon" onClick={handleSearch}>
          Search
        </button>
      </div>
      <div className="table-header">
        <div className="checkbox">
          <input
            type="checkbox"
            checked={selectedRows.length === users.length}
            onChange={handleSelectAll}
          />
        </div>
        <div>ID</div>
        <div>Name</div>
        <div>Email</div>
        <div>Role</div>
        <div>Actions</div>
      </div>
      {filteredUsers.map(user => (
        <div key={user.id} className={`table-row ${selectedRows.includes(user.id) ? 'selected' : ''}`}>
          <div className="checkbox">
            <input
              type="checkbox"
              checked={selectedRows.includes(user.id)}
              onChange={() => handleCheckboxChange(user.id)}
            />
          </div>
          <div>{user.id}</div>
          <div>
            {user.isEditing ? (
              <input
                type="text"
                value={user.editedFields.name || user.name}
                onChange={(e) => handleInputChange(user.id, 'name', e.target.value)}
              />
            ) : (
              user.name
            )}
          </div>
          <div>
            {user.isEditing ? (
              <input
                type="text"
                value={user.editedFields.email || user.email}
                onChange={(e) => handleInputChange(user.id, 'email', e.target.value)}
              />
            ) : (
              user.email
            )}
          </div>
          <div>
            {user.isEditing ? (
              <input
                type="text"
                value={user.editedFields.role || user.role}
                onChange={(e) => handleInputChange(user.id, 'role', e.target.value)}
              />
            ) : (
              user.role
            )}
          </div>
          <div className="actions">
      {user.isEditing ? (
        <>
          <button className="save" onClick={() => handleSave(user.id)}>
          <FontAwesomeIcon icon={faSave} /> 
          </button>
        </>
      ) : (
        <>
          <button className="edit" onClick={() => handleEdit(user.id)}>
          <FontAwesomeIcon icon={faEdit} /> 
          </button>
          <button className="delete" onClick={() => handleDelete(user.id)}>
          <FontAwesomeIcon icon={faTrashAlt} /> 
          </button>
        </>
      )}
    </div>
        </div>
      ))}
      <div className="pagination">
        <button className="first-page" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
          First Page
        </button>
        <button className="previous-page" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous Page
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
  <button
    key={index + 1}
    className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
    onClick={() => handlePageChange(index + 1)}
  >
    {index + 1}
  </button>
))}

        <button className="next-page" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next Page
        </button>
        <button className="last-page" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
          Last Page
        </button>
      </div>
      <button className="bulk-delete" onClick={handleDeleteSelected}>
        <FontAwesomeIcon icon={faTrashAlt}/>
      </button>
    </div>
  );
};

export default UserTable;
