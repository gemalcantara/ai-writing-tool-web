import { Dispatch, SetStateAction } from 'react';
import { ArticleState } from '../types/article';

export const fetchData = async (endpoint: string, setter: (data: any) => void) => {
  try {
    const response = await fetch(`/api/${endpoint}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    setter(data);
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
  }
};

export const fetchArticleById = async (id: string) => {
  try {
    const response = await fetch(`/api/articles/${id}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch article by ID: ${id}`, error);
    throw error;
  }
};