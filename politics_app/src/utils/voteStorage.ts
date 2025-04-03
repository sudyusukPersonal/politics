// src/utils/voteStorage.ts
/**
 * ユーザーの投票情報をローカルストレージに保存する
 * @param entityId 投票対象のID（政治家、政策、政党）
 * @param voteType 投票タイプ（"support" | "oppose"）
 */
export const saveVoteToLocalStorage = (
  entityId: string,
  voteType: "support" | "oppose"
): void => {
  try {
    // キーをIDのみに簡素化
    localStorage.setItem(entityId, voteType);
    console.log(`投票が保存されました: ${entityId} - ${voteType}`);
  } catch (error) {
    console.error("投票情報の保存に失敗しました:", error);
  }
};

/**
 * ユーザーの投票情報をローカルストレージから取得する
 * @param entityId 投票対象のID
 * @returns 投票タイプ（"support"または"oppose"）、未投票の場合はnull
 */
export const getVoteFromLocalStorage = (
  entityId: string
): "support" | "oppose" | null => {
  try {
    const vote = localStorage.getItem(entityId);
    return vote as "support" | "oppose" | null;
  } catch (error) {
    console.error("投票情報の取得に失敗しました:", error);
    return null;
  }
};

/**
 * ユーザーがすでに投票済みかどうか確認する
 * @param entityId 投票対象のID
 * @returns 投票済みの場合はtrue、未投票の場合はfalse
 */
export const hasVoted = (entityId: string): boolean => {
  return getVoteFromLocalStorage(entityId) !== null;
};
