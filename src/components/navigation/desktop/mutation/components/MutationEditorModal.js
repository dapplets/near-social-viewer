import React, { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import styles from "./MutationEditorModal.module.scss";
import { Close } from "../assets/icons/Close";
import { Plus } from "../assets/icons/Plus";
import cn from "classnames";
import { InputBlock } from "./InputBlock";
import { PairBlock } from "./PairBlock";
import { ButtonDropdown } from "./ButtonDropdown";
import { ButtonDropdownItem } from "./ButtonDropdownItem";
import { useMutation } from "../../../../../contexts/MutationContext";

export function MutationEditorModal({ mutation: _mutation, setEdit }) {
  const [mutation, setMutation] = useState(_mutation);
  const [isEdited, setIsEdited] = useState(false);

  const isNewMutation = !mutation;
  const isEditMutation = !!mutation;

  const {
    createLocalMutation,
    updateLocalMutation,
    selectMutation,
    isPickingMode,
    publishLocalMutation,
    proposeToRemoteMutation,
    revertLocalChanges,
  } = useMutation();

  const [overrides, setOverrides] = useState(
    mutation?.overrides.map((override) => ({ id: uuid(), ...override })) ?? []
  );

  const [mutationIdInputValue, setMutationIdInputValue] = useState(
    mutation?.mutationId ?? ""
  );

  const handleChangeMutationId = (event) => {
    setMutationIdInputValue(event.target.value);
    setOpen(false);
  };

  const handleAddOverride = () => {
    setIsEdited(true);
    setOverrides((overrides) => [
      ...overrides,
      { id: uuid(), from: null, to: null },
    ]);
  };

  const handleRemoveOverride = (removingOverrideId) => {
    setIsEdited(true);
    setOverrides((overrides) =>
      overrides.filter((override) => override.id !== removingOverrideId)
    );
  };

  const handleChangeOverride = (newOverride) => {
    setIsEdited(true);
    setOverrides((overrides) => {
      const clone = [...overrides];
      const index = clone.findIndex(
        (override) => override.id === newOverride.id
      );
      clone[index] = newOverride;
      return clone;
    });
  };

  const handleSaveLocallyClick = () => {
    if (!mutationIdInputValue) return;

    setIsEdited(false);

    if (!mutation) {
      const newMutation = {
        id: "local/" + mutationIdInputValue,
        mutationId: mutationIdInputValue,
        title: mutationIdInputValue,
        authorId: "local",
        overrides,
      };
      createLocalMutation(newMutation);
      setMutation(newMutation);
      selectMutation(newMutation.id);
    } else {
      const newMutation = {
        id: mutation.id,
        mutationId: mutation.mutationId,
        title: mutation.title,
        authorId: mutation.authorId,
        overrides,
        isEdited: true,
      };
      updateLocalMutation(newMutation);
      setMutation(newMutation);
    }
  };

  const handlePublishLocalMutation = async () => {
    handleSaveLocallyClick();
    if (!mutation) {
      publishLocalMutation("local/" + mutationIdInputValue);
    } else {
      publishLocalMutation(mutation.id);
    }
  };

  const handleProposeClick = async () => {
    if (!mutation) return;

    handleSaveLocallyClick();
    await proposeToRemoteMutation(mutation);
  };

  const handleRevertClick = () => {
    revertLocalChanges(mutation.id);
  };

  return (
    <div
      className={cn(styles.wrapper)}
      style={{ display: isPickingMode ? "none" : undefined }}
    >
      <div className={cn(styles.titleBlock)}>
        <div className={cn(styles.title)}>Override rules</div>
        <span onClick={() => setEdit(false)}>
          <Close />
        </span>
      </div>

      <div className={cn(styles.inputWrapper)}>
        <InputBlock
          value={mutationIdInputValue}
          disabled={isEditMutation}
          placeholder="Type Mutation ID"
          onChange={handleChangeMutationId}
        />
        <ButtonDropdown
          label="Save Locally"
          disabled={!mutationIdInputValue}
          onClick={handleSaveLocallyClick}
        >
          {mutation?.isEdited ? (
            <ButtonDropdownItem
              label="Revert changes"
              disabled={!mutationIdInputValue}
              onClick={handleRevertClick}
            />
          ) : null}
          {mutation?.authorId.endsWith(".sputnik-dao.near") ? (
            <ButtonDropdownItem
              label="Propose"
              disabled={!mutationIdInputValue || !mutation}
              onClick={handleProposeClick}
            />
          ) : null}
          <ButtonDropdownItem
            label="Publish"
            disabled={!mutationIdInputValue}
            onClick={handlePublishLocalMutation}
          />
        </ButtonDropdown>
      </div>

      {mutation && mutation.authorId && mutation.authorId !== "local" && (
        <div className={cn(styles.subtitleBlock)}>by {mutation.authorId}</div>
      )}

      {overrides.map((override) => (
        <PairBlock
          key={override.id}
          override={override}
          onChange={(override) => handleChangeOverride(override)}
          onRemove={() => handleRemoveOverride(override.id)}
        />
      ))}

      <div
        onClick={() => handleAddOverride()}
        className={cn(styles.bottomBlock)}
      >
        <Plus />
        <div className={cn(styles.bottomText)}>Add override</div>
      </div>
    </div>
  );
}
