import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authStorage } from '../lib/api/client';
import { authService, getOAuthUrl } from '../services/auth.service';
import { workspacesService } from '../services/workspaces.service';
import { projectsService } from '../services/projects.service';
import { User, Workspace, Project, Organization, LoginRequest, RegisterRequest, TokenResponse, WorkspaceCreate } from '../types/api';

interface AuthContextValue {
  token: string | null;
  user: User | null;
  organization: Organization | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  projects: Project[];
  activeProject: Project | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<TokenResponse>;
  register: (data: RegisterRequest) => Promise<TokenResponse>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  logout: () => void;
  setManualToken: (token: string) => Promise<void>;
  setActiveWorkspace: (ws: Workspace) => void;
  setActiveProject: (proj: Project | null) => void;
  refreshUserData: () => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  refreshProjects: (workspaceId?: string) => Promise<void>;
  createWorkspace: (data: WorkspaceCreate) => Promise<Workspace>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  workspace: 'quickbit_last_workspace_id',
  project: 'quickbit_last_project_id',
} as const;

function saveLastWorkspace(id: string) {
  try { localStorage.setItem(STORAGE_KEYS.workspace, id); } catch {}
}
function saveLastProject(id: string) {
  try { localStorage.setItem(STORAGE_KEYS.project, id); } catch {}
}
function getLastWorkspace(): string | null {
  try { return localStorage.getItem(STORAGE_KEYS.workspace); } catch { return null; }
}
function getLastProject(): string | null {
  try { return localStorage.getItem(STORAGE_KEYS.project); } catch { return null; }
}
function clearLastSelection() {
  try {
    localStorage.removeItem(STORAGE_KEYS.workspace);
    localStorage.removeItem(STORAGE_KEYS.project);
  } catch {}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => authStorage.getToken());
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('quickbit_user_session');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    authStorage.removeToken();
    clearLastSelection();
    try {
      localStorage.removeItem('quickbit_user_session');
    } catch {}
    setToken(null);
    setUser(null);
    setOrganization(null);
    setWorkspaces([]);
    setActiveWorkspaceState(null);
    setProjects([]);
    setActiveProjectState(null);
  }, []);

  const refreshProjects = useCallback(
    async (workspaceId?: string) => {
      const targetWsId = workspaceId || activeWorkspace?.id;
      if (!targetWsId || !authStorage.getToken()) {
        setProjects([]);
        setActiveProjectState(null);
        return;
      }

      try {
        const projectList = await projectsService.list(targetWsId);
        if (projectList && projectList.length > 0) {
          setProjects(projectList);
          setActiveProjectState((prev) => {
            if (prev && projectList.some((p) => p.id === prev.id)) {
              return prev;
            }
            const next = projectList[0];
            saveLastProject(next.id);
            return next;
          });
        } else {
          setProjects([]);
          setActiveProjectState(null);
        }
      } catch (err) {
        setProjects([]);
        setActiveProjectState(null);
      }
    },
    [activeWorkspace]
  );

  const refreshWorkspaces = useCallback(async () => {
    if (!authStorage.getToken()) return;

    try {
      const wsList = await workspacesService.list();
      if (wsList && wsList.length > 0) {
        setWorkspaces(wsList);
        setActiveWorkspaceState((prev) => {
          if (prev && wsList.some((w) => w.id === prev.id)) {
            return wsList.find((w) => w.id === prev.id) || wsList[0];
          }
          return wsList[0];
        });
      }
    } catch (err) {
      setWorkspaces((prev) => (prev.length > 0 ? prev : []));
      setActiveWorkspaceState((prev) => prev || null);
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    const currentToken = authStorage.getToken();
    if (!currentToken) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authService.getMe();
      if (userData) {
        setUser(userData);
        try {
          localStorage.setItem('quickbit_user_session', JSON.stringify(userData));
        } catch {}
      }

      const wsList = await workspacesService.list().catch(() => []);
      const validWsList = Array.isArray(wsList) ? wsList : [];
      setWorkspaces(validWsList);

      if (validWsList.length === 0) {
        setActiveWorkspaceState(null);
        setProjects([]);
        setActiveProjectState(null);
        return;
      }

      const savedWsId = getLastWorkspace();
      const selectedWs = (savedWsId && validWsList.find((w) => w.id === savedWsId)) || validWsList[0];
      setActiveWorkspaceState(selectedWs);
      saveLastWorkspace(selectedWs.id);

      const projList = await projectsService.list(selectedWs.id).catch(() => []);
      const validProjList = Array.isArray(projList) ? projList : [];
      setProjects(validProjList);

      if (validProjList.length > 0) {
        const savedProjId = getLastProject();
        const selectedProj = (savedProjId && validProjList.find((p) => p.id === savedProjId)) || validProjList[0];
        setActiveProjectState(selectedProj);
        saveLastProject(selectedProj.id);
      } else {
        setActiveProjectState(null);
      }
    } catch (err) {
      const savedUser = localStorage.getItem('quickbit_user_session');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setWorkspaces([]);
          setActiveWorkspaceState(null);
          setProjects([]);
          setActiveProjectState(null);
        } catch {}
      } else {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshUserData();

    const handleUnauthorized = () => {
      // If token was an external API failure, verify if user has active session
      const savedUser = localStorage.getItem('quickbit_user_session');
      if (!savedUser) {
        logout();
      }
    };

    window.addEventListener('quickbit:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('quickbit:unauthorized', handleUnauthorized);
    };
  }, [refreshUserData, logout]);

  const createWorkspace = useCallback(
    async (data: WorkspaceCreate): Promise<Workspace> => {
      const ws = await workspacesService.create(data);
      setWorkspaces((prev) => [ws, ...prev.filter((w) => w.id !== ws.id)]);
      setActiveWorkspaceState(ws);
      await refreshProjects(ws.id);
      return ws;
    },
    [refreshProjects]
  );

  const setActiveWorkspace = useCallback(
    (ws: Workspace) => {
      setActiveWorkspaceState(ws);
      if (ws?.id) {
        saveLastWorkspace(ws.id);
        refreshProjects(ws.id);
      }
    },
    [refreshProjects]
  );

  const setActiveProject = useCallback((proj: Project | null) => {
    setActiveProjectState(proj);
    if (proj?.id) {
      saveLastProject(proj.id);
    }
  }, []);

  const login = async (data: LoginRequest): Promise<TokenResponse> => {
    const res = await authService.login(data);
    if (res.access_token) {
      authStorage.setToken(res.access_token);
      setToken(res.access_token);
      if (res.user) {
        setUser(res.user);
        try {
          localStorage.setItem('quickbit_user_session', JSON.stringify(res.user));
        } catch {}
      }
      if (res.organization) setOrganization(res.organization);
      if (res.workspace) {
        setActiveWorkspaceState(res.workspace);
        setWorkspaces([res.workspace]);
      }
      await refreshUserData();
    }
    return res;
  };

  const register = async (data: RegisterRequest): Promise<TokenResponse> => {
    const res = await authService.register(data);
    if (res.access_token) {
      authStorage.setToken(res.access_token);
      setToken(res.access_token);
      if (res.user) {
        setUser(res.user);
        try {
          localStorage.setItem('quickbit_user_session', JSON.stringify(res.user));
        } catch {}
      }
      if (res.organization) setOrganization(res.organization);
      if (res.workspace) {
        setActiveWorkspaceState(res.workspace);
        setWorkspaces([res.workspace]);
      }
      await refreshUserData();
    }
    return res;
  };

  const loginWithGoogle = useCallback(async () => {
    try {
      localStorage.setItem('quickbit_oauth_pending', 'google');
    } catch {}
    window.location.assign(getOAuthUrl('google'));
  }, []);

  const loginWithGitHub = useCallback(async () => {
    try {
      localStorage.setItem('quickbit_oauth_pending', 'github');
    } catch {}
    window.location.assign(getOAuthUrl('github'));
  }, []);

  const setManualToken = async (newToken: string) => {
    authStorage.setToken(newToken.trim());
    setToken(newToken.trim());
    setIsLoading(true);
    await refreshUserData();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        organization,
        workspaces,
        activeWorkspace,
        projects,
        activeProject,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        loginWithGitHub,
        logout,
        setManualToken,
        setActiveWorkspace,
        setActiveProject,
        refreshUserData,
        refreshWorkspaces,
        refreshProjects,
        createWorkspace,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
