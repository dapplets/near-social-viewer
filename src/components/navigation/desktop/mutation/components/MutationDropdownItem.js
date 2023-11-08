import React, { useEffect, useState } from "react";
import { visibleText } from "../helpers/visibleText";
import { Trash } from "../assets/icons/Trash";
import styles from "./MutationDropdownItem.module.scss";
import { Edit } from "../assets/icons/Edit";
import cn from "classnames";
import { StarFilled } from "../assets/icons/StarFilled";
import { Star } from "../assets/icons/Star";

export function MutationDropdownItem({
  mutation,
  isSelected,
  isStarred,
  onRemoveClick,
  onMutationClick,
  onMutationEditClick,
  onStarClick,
}) {
  return (
    <div
      className={cn(styles.itemMutation, {
        [styles.itemMutationBg]: isSelected,
      })}
    >
      {/* <div onClick={onStarClick} className={styles.starIcon}>
        {isStarred ? <StarFilled /> : <Star />}
      </div> */}

      <div onClick={onMutationClick} className={cn(styles.blockLeft)}>
        <div className={cn(styles.blockTitle)}>
          {mutation.isLocal ? (
            <div className={cn(styles.label)}>Local</div>
          ) : null}
          {mutation.isEdited ? (
            <div className={cn(styles.label)}>Edited</div>
          ) : null}
          <span className={cn(styles.titleMutation)}>
            {visibleText(mutation.mutationId)}
          </span>
        </div>
        <span className={cn(styles.mutationSublitle, {})}>
          {mutation.authorId && mutation.authorId !== "local"
            ? `by ` + visibleText(mutation.authorId)
            : null}
        </span>
      </div>

      {isSelected ? (
        <span onClick={onMutationEditClick} className={styles.editIcon}>
          <Edit />
        </span>
      ) : null}

      {!isSelected && mutation.isLocal ? (
        <span className={styles.deleteUsersContainer} onClick={onRemoveClick}>
          <Trash />
        </span>
      ) : null}
    </div>
  );
}
