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

export const removeVoteFromLocalStorage = (entityId: string): void => {
  try {
    localStorage.removeItem(entityId);
    console.log(`投票が削除されました: ${entityId}`);
  } catch (error) {
    console.error("投票情報の削除に失敗しました:", error);
  }
};

/**
 * セッションストレージのキー
 */
const REPORTED_ITEMS_KEY = "reported_comments";

/**
 * 通報済みのコメントIDをセッションストレージに保存する
 * @param id 通報対象のID（コメントIDまたは返信ID）
 */
export const saveReportToSessionStorage = (id: string): void => {
  try {
    // 既存のデータを取得
    let reportedItems: Record<string, boolean> = {};
    const storedData = sessionStorage.getItem(REPORTED_ITEMS_KEY);

    if (storedData) {
      reportedItems = JSON.parse(storedData);
    }

    // IDをキーとして保存（値はtrueで固定）
    reportedItems[id] = true;

    // セッションストレージに保存
    sessionStorage.setItem(REPORTED_ITEMS_KEY, JSON.stringify(reportedItems));

    console.log(`通報が保存されました: ${id}`);
  } catch (error) {
    console.error("通報情報の保存に失敗しました:", error);
  }
};

/**
 * 指定したIDが通報済みかどうかを確認する (O(1)の検索)
 * @param id 確認するID（コメントIDまたは返信ID）
 * @returns 通報済みの場合はtrue、未通報の場合はfalse
 */
export const isReported = (id: string): boolean => {
  try {
    const storedData = sessionStorage.getItem(REPORTED_ITEMS_KEY);

    if (!storedData) {
      return false;
    }

    const reportedItems: Record<string, boolean> = JSON.parse(storedData);

    // オブジェクトのキーとして存在するかをチェック (O(1)の操作)
    return !!reportedItems[id];
  } catch (error) {
    console.error("通報情報の取得に失敗しました:", error);
    return false;
  }
};

/**
 * 通報済みのIDをすべて取得する
 * @returns 通報済みのIDの配列
 */
export const getAllReportedIds = (): string[] => {
  try {
    const storedData = sessionStorage.getItem(REPORTED_ITEMS_KEY);

    if (!storedData) {
      return [];
    }

    const reportedItems: Record<string, boolean> = JSON.parse(storedData);

    // オブジェクトのキー（ID）を配列として返す
    return Object.keys(reportedItems);
  } catch (error) {
    console.error("通報情報の取得に失敗しました:", error);
    return [];
  }
};

/**
 * 指定したIDの通報を削除する
 * @param id 削除する通報のID
 */
export const removeReportFromSessionStorage = (id: string): void => {
  try {
    const storedData = sessionStorage.getItem(REPORTED_ITEMS_KEY);

    if (!storedData) {
      return;
    }

    const reportedItems: Record<string, boolean> = JSON.parse(storedData);

    // 指定されたIDを削除
    delete reportedItems[id];

    // セッションストレージに保存
    sessionStorage.setItem(REPORTED_ITEMS_KEY, JSON.stringify(reportedItems));

    console.log(`通報が削除されました: ${id}`);
  } catch (error) {
    console.error("通報情報の削除に失敗しました:", error);
  }
};
