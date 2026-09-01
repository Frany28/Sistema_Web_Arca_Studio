import { AdminUserFormModal } from "./CreateAdminUserModal.jsx";

function EditAdminUserModal({ onClose, onUpdate, open, roles, user }) {
  return (
    <AdminUserFormModal
      mode="edit"
      onClose={onClose}
      onSubmit={onUpdate}
      open={open}
      roles={roles}
      user={user}
    />
  );
}

export default EditAdminUserModal;
