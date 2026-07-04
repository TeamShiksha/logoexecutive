import { useState, useEffect, useRef } from "react";
import { useApi } from "../../hooks/useApi";
import { instance } from "../../api/api_instance";
import { useToast } from "../../hooks/useToast";
import Modal from "../common/modal/Modal.jsx";
import Button from "../common/button/Button.jsx";
import CustomInput from "../common/input/CustomInput.jsx";
import LoadingSpinner from "../common/loadingspinner/LoadingSpinner.jsx";
import ConfirmationModal from "../confirm/ConfirmationModal.jsx";
import styles from "./MilestoneConfig.module.css";
import { MILESTONE_CONFIG } from "../../utils/Constants.js";
import { MoreVertical, Plus, Trash2 } from "lucide-react";
import PropTypes from "prop-types";

function formatThresholds(thresholds) {
  if (!thresholds?.length) return "No thresholds";
  const count = thresholds.length;
  const preview = thresholds
    .slice(0, 3)
    .map((t) => `${t.at}→${t.points}pts`)
    .join(", ");
  const suffix = count > 3 ? ` +${count - 3} more` : "";
  return `${count} tier${count === 1 ? "" : "s"}: ${preview}${suffix}`;
}

let thresholdKeyCounter = 0;
const makeThreshold = (at = "", points = "") => ({
  _key: ++thresholdKeyCounter,
  at,
  points,
});

function MilestoneConfig({ embedded = false }) {
  const toast = useToast();

  const [configs, setConfigs] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formName, setFormName] = useState("");
  const [formThresholds, setFormThresholds] = useState([makeThreshold()]);
  const [isSaving, setIsSaving] = useState(false);

  const [activateTarget, setActivateTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const [viewingConfig, setViewingConfig] = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const { fetchRequest, loading } = useApi({
    method: "GET",
    url: "/admin/milestones",
  });

  const loadConfigs = async () => {
    const { success, data, error } = await fetchRequest();
    if (success && data) {
      setConfigs(data.data ?? []);
    } else if (error) {
      toast.error(MILESTONE_CONFIG.toasts.loadError);
    }
    setInitialized(true);
  };

  useEffect(() => {
    loadConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const resetForm = () => {
    setFormName("");
    setFormThresholds([makeThreshold()]);
    setEditingConfig(null);
    setIsFormOpen(false);
  };

  const openCreateForm = () => {
    setEditingConfig(null);
    setFormName("");
    setFormThresholds([makeThreshold()]);
    setIsFormOpen(true);
  };

  const openEditForm = (config) => {
    setEditingConfig(config);
    setFormName(config.name);
    setFormThresholds(
      config.thresholds.map((t) =>
        makeThreshold(String(t.at), String(t.points))
      )
    );
    setIsFormOpen(true);
  };

  const handleThresholdChange = (index, field, value) => {
    setFormThresholds((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const addThreshold = () => {
    const last = formThresholds[formThresholds.length - 1];
    if (!last.at || !last.points) {
      toast.error(
        "Please fill in the current threshold before adding another."
      );
      return;
    }
    setFormThresholds((prev) => [...prev, makeThreshold()]);
  };

  const removeThreshold = (index) => {
    setFormThresholds((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formName.trim()) return "Name is required.";
    if (formThresholds.length === 0)
      return "At least one threshold is required.";
    for (let i = 0; i < formThresholds.length; i++) {
      const t = formThresholds[i];
      const at = Number(t.at);
      const points = Number(t.points);
      if (!t.at || Number.isNaN(at) || at < 1 || !Number.isInteger(at))
        return "Each threshold must have a positive integer 'at' value.";
      if (
        !t.points ||
        Number.isNaN(points) ||
        points < 1 ||
        !Number.isInteger(points)
      )
        return "Each threshold must have a positive integer 'points' value.";
      if (i > 0) {
        const prevAt = Number(formThresholds[i - 1].at);
        const prevPoints = Number(formThresholds[i - 1].points);
        if (at <= prevAt)
          return "Threshold 'at' values must be in strictly ascending order.";
        if (points < prevPoints)
          return "Threshold 'points' values must be in ascending order.";
      }
    }
    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setIsSaving(true);
    const payload = {
      name: formName.trim(),
      thresholds: formThresholds.map((t) => ({
        at: Number(t.at),
        points: Number(t.points),
      })),
    };

    try {
      if (editingConfig) {
        await instance({
          method: "PATCH",
          url: `/admin/milestones/${editingConfig._id}`,
          data: payload,
        });
        toast.success(MILESTONE_CONFIG.toasts.updateSuccess);
      } else {
        await instance({
          method: "POST",
          url: "/admin/milestones",
          data: payload,
        });
        toast.success(MILESTONE_CONFIG.toasts.createSuccess);
      }
      resetForm();
      await loadConfigs();
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        (editingConfig
          ? MILESTONE_CONFIG.toasts.updateError
          : MILESTONE_CONFIG.toasts.createError);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async () => {
    if (!activateTarget) return;
    setIsConfirmLoading(true);
    try {
      await instance({
        method: "PATCH",
        url: `/admin/milestones/${activateTarget._id}/activate`,
      });
      toast.success(MILESTONE_CONFIG.toasts.activateSuccess);
      setActivateTarget(null);
      await loadConfigs();
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        MILESTONE_CONFIG.toasts.activateError;
      toast.error(msg);
    } finally {
      setIsConfirmLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsConfirmLoading(true);
    try {
      await instance({
        method: "DELETE",
        url: `/admin/milestones/${deleteTarget._id}`,
      });
      toast.success(MILESTONE_CONFIG.toasts.deleteSuccess);
      setDeleteTarget(null);
      await loadConfigs();
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        MILESTONE_CONFIG.toasts.deleteError;
      toast.error(msg);
    } finally {
      setIsConfirmLoading(false);
    }
  };

  const renderContent = () => {
    if (loading || !initialized) {
      return (
        <div className={styles["loading-container"]}>
          <LoadingSpinner size={36} border={3} color="var(--primary)" />
        </div>
      );
    }

    if (configs.length === 0) {
      return (
        <p className={styles["empty-state"]}>{MILESTONE_CONFIG.emptyState}</p>
      );
    }

    return (
      <div className={styles["table-wrapper"]}>
        <table className={styles.table}>
          <thead>
            <tr>
              {MILESTONE_CONFIG.tableHeaders.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {configs.map((config) => (
              <tr key={config._id}>
                <td>
                  <p className={styles["config-name"]}>{config.name}</p>
                </td>
                <td>
                  <button
                    type="button"
                    className={styles["thresholds-summary-btn"]}
                    onClick={() => setViewingConfig(config)}
                    title="View all thresholds"
                  >
                    {formatThresholds(config.thresholds)}
                  </button>
                </td>
                <td>
                  <span
                    className={`${styles["status-badge"]} ${
                      config.is_active
                        ? styles["status-badge-active"]
                        : styles["status-badge-inactive"]
                    }`}
                  >
                    {config.is_active
                      ? MILESTONE_CONFIG.status.active
                      : MILESTONE_CONFIG.status.inactive}
                  </span>
                </td>
                <td className={styles["menu-cell"]}>
                  {!config.is_active && (
                    <div
                      className={styles["menu-wrapper"]}
                      ref={openMenuId === config._id ? menuRef : null}
                    >
                      <button
                        className={styles["menu-btn"]}
                        aria-label="Row actions"
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === config._id ? null : config._id
                          )
                        }
                      >
                        <MoreVertical size={16} aria-hidden="true" />
                      </button>
                      {openMenuId === config._id && (
                        <div className={styles["action-menu"]}>
                          <button
                            className={styles["action-item"]}
                            onClick={() => {
                              setOpenMenuId(null);
                              openEditForm(config);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className={styles["action-item"]}
                            onClick={() => {
                              setOpenMenuId(null);
                              setActivateTarget(config);
                            }}
                          >
                            Activate
                          </button>
                          <button
                            className={`${styles["action-item"]} ${styles["action-item-danger"]}`}
                            onClick={() => {
                              setOpenMenuId(null);
                              setDeleteTarget(config);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      className={embedded ? undefined : styles.panel}
      data-testid="milestone-config-panel"
    >
      <div className={styles["panel-header"]}>
        <div className={styles["panel-title-group"]}>
          <h2 className={styles["panel-title"]}>{MILESTONE_CONFIG.title}</h2>
          <p className={styles["panel-subtitle"]}>
            {MILESTONE_CONFIG.subtitle}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openCreateForm}
          className={styles["create-btn"]}
        >
          {MILESTONE_CONFIG.createButton}
        </Button>
      </div>

      {renderContent()}

      <Modal
        isOpen={isFormOpen}
        onClose={resetForm}
        customWidth="480px"
        data-testid="milestone-form-modal"
      >
        <div className={styles["modal-body"]}>
          <div>
            <h2 className={styles["modal-title"]}>
              {editingConfig
                ? MILESTONE_CONFIG.modal.editTitle
                : MILESTONE_CONFIG.modal.createTitle}
            </h2>
          </div>

          <CustomInput
            type="text"
            name="configName"
            label={MILESTONE_CONFIG.modal.nameLabel}
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />

          <div>
            <span className={styles["modal-label"]}>
              {MILESTONE_CONFIG.modal.thresholdsLabel}
            </span>
            <div className={styles["thresholds-list"]}>
              {formThresholds.map((threshold, index) => (
                <div key={threshold._key} className={styles["threshold-row"]}>
                  <div className={styles["threshold-input"]}>
                    <label>{MILESTONE_CONFIG.modal.atLabel}</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={threshold.at}
                      onChange={(e) =>
                        handleThresholdChange(index, "at", e.target.value)
                      }
                      placeholder="5"
                    />
                  </div>
                  <div className={styles["threshold-input"]}>
                    <label>{MILESTONE_CONFIG.modal.pointsLabel}</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={threshold.points}
                      onChange={(e) =>
                        handleThresholdChange(index, "points", e.target.value)
                      }
                      placeholder="10"
                    />
                  </div>
                  {formThresholds.length > 1 && (
                    <button
                      type="button"
                      className={styles["remove-btn"]}
                      onClick={() => removeThreshold(index)}
                      title={MILESTONE_CONFIG.modal.removeThreshold}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className={styles["add-threshold-btn"]}
              onClick={addThreshold}
            >
              <Plus size={16} aria-hidden="true" />
              {MILESTONE_CONFIG.modal.addThreshold}
            </button>
          </div>

          <div className={styles["modal-actions"]}>
            <Button variant="secondary" onClick={resetForm}>
              {MILESTONE_CONFIG.modal.cancelButton}
            </Button>
            <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
              {MILESTONE_CONFIG.modal.saveButton}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!viewingConfig}
        onClose={() => setViewingConfig(null)}
        customWidth="420px"
        data-testid="view-thresholds-modal"
      >
        <div className={styles["modal-body"]}>
          <div>
            <h2 className={styles["modal-title"]}>{viewingConfig?.name}</h2>
            <p className={styles["modal-subtitle"]}>
              {viewingConfig?.thresholds?.length ?? 0} threshold
              {(viewingConfig?.thresholds?.length ?? 0) === 1 ? "" : "s"}
            </p>
          </div>

          <div className={styles["view-thresholds-list"]}>
            {viewingConfig?.thresholds?.map((t) => (
              <div
                key={`${t.at}-${t.points}`}
                className={styles["view-threshold-row"]}
              >
                <span className={styles["view-threshold-at"]}>
                  {t.at} submission{t.at === 1 ? "" : "s"}
                </span>
                <span className={styles["view-threshold-arrow"]}>&rarr;</span>
                <span className={styles["view-threshold-points"]}>
                  {t.points} point{t.points === 1 ? "" : "s"}
                </span>
              </div>
            ))}
          </div>

          <div className={styles["modal-actions"]}>
            <Button variant="secondary" onClick={() => setViewingConfig(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={!!activateTarget}
        onClose={() => setActivateTarget(null)}
        onConfirm={handleActivate}
        isConfirmLoading={isConfirmLoading}
        customHeading={MILESTONE_CONFIG.activate.heading}
        customDescription={MILESTONE_CONFIG.activate.description}
        confirmButtonContent={MILESTONE_CONFIG.activate.confirmButton}
        customWidth="500px"
      />

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isConfirmLoading={isConfirmLoading}
        customHeading={MILESTONE_CONFIG.delete.heading}
        customDescription={MILESTONE_CONFIG.delete.description}
        confirmButtonContent={MILESTONE_CONFIG.delete.confirmButton}
      />
    </div>
  );
}

MilestoneConfig.propTypes = {
  embedded: PropTypes.bool,
};

export default MilestoneConfig;
