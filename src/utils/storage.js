const STORAGE_KEY = 'flow_knowledge_manager_projects';

export const loadProjects = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('プロジェクトの読み込みに失敗しました:', error);
    return [];
  }
};

export const saveProjects = (projects) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch (error) {
    console.error('プロジェクトの保存に失敗しました:', error);
    return false;
  }
};

export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('データの削除に失敗しました:', error);
    return false;
  }
};
