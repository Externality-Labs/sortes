import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  registerRecipient,
  updateRecipient,
  Recipient,
} from '../services/api/governance';
import { showSucc, showError } from '../utils/notify';

export interface RecipientFormData {
  name: string;
  type: 'organization' | 'individual' | '';
  network: string;
  donationAddress: string;
  website: string;
  twitter: string;
  introduction: string;
  category: string;
}

// Draft数据接口，继承自RecipientFormData并添加额外字段
export interface DraftRecipientData extends RecipientFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

const initialFormData: RecipientFormData = {
  name: '',
  type: '',
  network: '',
  donationAddress: '',
  website: '',
  twitter: '',
  introduction: '',
  category: '',
};

// localStorage key for drafts
const DRAFT_STORAGE_KEY = 'recipient_drafts';

// Draft相关的工具函数
export const getDraftsFromStorage = (): DraftRecipientData[] => {
  try {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading drafts from localStorage:', error);
    return [];
  }
};

export const saveDraftToStorage = (draftData: DraftRecipientData): string => {
  try {
    const drafts = getDraftsFromStorage();
    const existingIndex = drafts.findIndex(
      (draft) => draft.id === draftData.id
    );

    if (existingIndex >= 0) {
      // 更新现有的draft
      drafts[existingIndex] = {
        ...draftData,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // 添加新的draft
      drafts.push(draftData);
    }

    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
    return draftData.id;
  } catch (error) {
    console.error('Error saving draft to localStorage:', error);
    throw new Error('Failed to save draft');
  }
};

export const deleteDraftFromStorage = (draftId: string): void => {
  try {
    const drafts = getDraftsFromStorage();
    const filteredDrafts = drafts.filter((draft) => draft.id !== draftId);
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(filteredDrafts));
  } catch (error) {
    console.error('Error deleting draft from localStorage:', error);
  }
};

export const useRecipientForm = (
  visible: boolean,
  setVisible: (visible: boolean) => void,
  mode: 'create' | 'edit' = 'create',
  recipientData?: Recipient
) => {
  // 判断name字段是否可编辑：创建模式或编辑模式下name为空时
  const isNameEditable =
    mode !== 'edit' ||
    (mode === 'edit' &&
      (!recipientData?.name || recipientData.name.trim() === ''));
  // 表单数据状态
  const [formData, setFormData] = useState<RecipientFormData>(initialFormData);
  // 错误信息
  const [errors, setErrors] = useState<
    Partial<Record<keyof RecipientFormData | 'type', string>>
  >({});
  // 字符计数
  const [charCount, setCharCount] = useState<number>(0);
  // 表单提交状态
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // 最大字符数
  const MAX_INTRODUCTION_LENGTH = 1000;

  // 重置表单到初始状态
  const resetForm = () => {
    if (mode === 'edit' && recipientData) {
      // 编辑模式：用传入的数据初始化表单
      const editFormData: RecipientFormData = {
        name: recipientData.name,
        type:
          recipientData.type === 'Organization' ? 'organization' : 'individual',
        network: '', // 网络字段可能不需要在编辑时显示
        donationAddress: recipientData.donationAddress,
        website: recipientData.website,
        twitter: recipientData.twitter,
        introduction: recipientData.introduction,
        category: recipientData.category || '',
      };
      setFormData(editFormData);
      setCharCount(recipientData.introduction.length);
    } else {
      // 创建模式：重置为空表单
      setFormData(initialFormData);
      setCharCount(0);
    }
    setErrors({});
    setIsSubmitting(false);
  };

  // 监听弹窗打开状态和模式变化，打开时重置表单
  useEffect(() => {
    if (visible) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, mode, recipientData]);

  // 验证EVM兼容链地址
  const isValidEVMAddress = (address: string): boolean => {
    return (
      ethers.utils.isAddress(address) &&
      address.length === 42 &&
      address.startsWith('0x')
    );
  };

  // 验证 URL 格式
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // 单字段验证（实时验证，不检查必填项）
  const validateField = (field: keyof RecipientFormData, value: string) => {
    let error: string | undefined;

    switch (field) {
      case 'name':
        if (value.length > 100) {
          error = 'Maximum length: 100 characters';
        }
        break;
      case 'donationAddress':
        if (value.trim() && !isValidEVMAddress(value)) {
          error =
            "Invalid address. Please enter a valid 42-character address starting with '0x'.";
        }
        break;
      case 'website':
        if (value && value.length > 100) {
          error = 'Maximum length: 100 characters';
        } else if (value && value !== 'N/A' && !isValidUrl(value)) {
          error = 'Please enter a valid URL or "N/A"';
        }
        break;
      case 'twitter':
        if (value && value.length > 100) {
          error = 'Maximum length: 100 characters';
        } else if (value && value !== 'N/A' && !isValidUrl(value)) {
          error = 'Please enter a valid URL or "N/A"';
        }
        break;
      case 'introduction':
        if (value.length > 1000) {
          error = 'Maximum length: 1000 characters';
        }
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  // 处理表单字段变化
  const handleChange = (field: keyof RecipientFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 实时验证字段
    validateField(field, value);
  };

  // 处理单选按钮变化
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as 'organization' | 'individual' | '';
    setFormData((prev) => ({
      ...prev,
      type: value,
    }));

    // 清除类型的错误信息（因为选择了值）
    setErrors((prev) => ({
      ...prev,
      type: undefined,
    }));
  };

  // 处理介绍文本变化
  const handleIntroductionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setCharCount(value.length);
    handleChange('introduction', value);
  };

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RecipientFormData | 'type', string>> =
      {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'This field is required.';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Maximum length: 100 characters';
    }

    // Type validation
    if (!formData.type) {
      newErrors.type = 'The selection is required. Please choose.';
    }

    // Donation Address validation
    if (!formData.donationAddress.trim()) {
      newErrors.donationAddress = 'This field is required.';
    } else if (!isValidEVMAddress(formData.donationAddress)) {
      newErrors.donationAddress =
        "Invalid address. Please enter a valid 42-character address starting with '0x'.";
    }

    // Website validation
    if (!formData.website.trim()) {
      newErrors.website = 'This field is required.';
    } else if (formData.website.length > 100) {
      newErrors.website = 'Maximum length: 100 characters';
    } else if (formData.website !== 'N/A' && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid URL or "N/A"';
    }

    // Twitter validation
    if (!formData.twitter.trim()) {
      newErrors.twitter = 'This field is required.';
    } else if (formData.twitter.length > 100) {
      newErrors.twitter = 'Maximum length: 100 characters';
    } else if (formData.twitter !== 'N/A' && !isValidUrl(formData.twitter)) {
      newErrors.twitter = 'Please enter a valid URL or "N/A"';
    }

    // Introduction validation
    if (!formData.introduction.trim()) {
      newErrors.introduction = 'This field is required.';
    } else if (formData.introduction.length > 1000) {
      newErrors.introduction = 'Maximum length: 1000 characters';
    }

    // Category validation
    if (!formData.category.trim()) {
      newErrors.category = 'This field is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存为草稿
  const handleSaveAsDraft = () => {
    try {
      // 如果是编辑现有的draft，使用原有的id；否则生成新的id
      const isDraftEdit =
        mode === 'edit' &&
        recipientData &&
        recipientData.id.toString().startsWith('draft_');
      const draftId = isDraftEdit
        ? recipientData.id.toString()
        : `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const draftData: DraftRecipientData = {
        ...formData,
        id: draftId,
        createdAt: isDraftEdit
          ? (recipientData as any).createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveDraftToStorage(draftData);

      // 关闭弹窗
      setVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  // 删除草稿
  const handleDeleteDraft = () => {
    try {
      if (
        mode === 'edit' &&
        recipientData &&
        recipientData.id.toString().startsWith('draft_')
      ) {
        deleteDraftFromStorage(recipientData.id.toString());

        // 关闭弹窗
        setVisible(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  // 关闭弹窗并重置表单
  const handleClose = () => {
    setVisible(false);
    resetForm();
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 如果是提交draft，先删除draft
      const isDraftSubmit =
        mode === 'edit' &&
        recipientData &&
        recipientData.id.toString().startsWith('draft_');
      if (isDraftSubmit) {
        deleteDraftFromStorage(recipientData.id.toString());
      }

      // 如果name字段不可编辑，说明数据库中已有记录，调用update
      if (!isNameEditable && mode === 'edit' && recipientData) {
        // 编辑模式且name不可编辑：调用 updateRecipient API
        const updatedRecipient: Recipient = {
          ...recipientData,
          type:
            formData.type === 'organization' ? 'Organization' : 'Individual',
          website: formData.website,
          twitter: formData.twitter,
          introduction: formData.introduction,
          category: formData.category,
        };

        await updateRecipient(updatedRecipient);

        // 显示成功提示
        showSucc('Recipient information updated successfully!');

        // 提交成功后关闭弹窗
        setVisible(false);
        return;
      }

      // 创建模式或draft提交：原有的注册逻辑
      if (!formData.donationAddress) {
        throw new Error('Donation address is required');
      }

      try {
        // 调用后端API注册接收者信息
        try {
          await registerRecipient({
            name: formData.name,
            type:
              formData.type === 'organization' ? 'Organization' : 'Individual',
            donationAddress: formData.donationAddress,
            website: formData.website,
            twitter: formData.twitter,
            introduction: formData.introduction,
            category: formData.category,
            verified: false,
          });
        } catch (apiError: any) {
          console.error('API registration error:', apiError);
          showError(
            `Failed to save recipient data: ${apiError.message || 'Unknown error'}`
          );
        }
      } catch (innerError) {
        throw new Error(
          `  ${innerError instanceof Error ? innerError.message : String(innerError)}`
        );
      }

      // 显示成功提示（仅针对合约注册成功的情况）
      showSucc('Recipient registered successfully!');

      // 提交成功后关闭弹窗
      setVisible(false);
    } catch (error: any) {
      console.error('Registration error:', error);

      // 解析错误信息并显示toast
      let errorMessage = 'Registration failed';
      if (error.message) {
        if (error.message.includes('Sortes contract not found')) {
          errorMessage = 'Contract not available. Please try again later.';
        } else if (error.message.includes('GOOD token contract not found')) {
          errorMessage = 'GOOD token contract not available.';
        } else if (error.message.includes('Donation address is required')) {
          errorMessage = 'Donation address is required.';
        } else if (error.message.includes('Token approval failed')) {
          errorMessage = error.message;
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction';
        } else if (error.message.includes('gas')) {
          errorMessage = 'Transaction failed due to gas issues';
        } else {
          errorMessage = error.message;
        }
      }

      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // 状态
    formData,
    errors,
    charCount,
    isSubmitting,
    isNameEditable,
    MAX_INTRODUCTION_LENGTH,

    // 方法
    handleChange,
    handleRadioChange,
    handleIntroductionChange,
    validateForm,
    resetForm,
    handleClose,
    handleSubmit,
    handleSaveAsDraft,
    handleDeleteDraft,
  };
};
