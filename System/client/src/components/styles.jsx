/** @format */

import styled from "styled-components";

export const Title = styled.h1`
  color: var(--primary);
  text-align: center;
  font-family: 'Playfair Display', serif;
`;

export const Form = styled.form`
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 24px;
  align-items: stretch;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

export const Input = styled.input`
  width: 100%;
  height: 3rem;
  font-size: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 5px;
  padding: 0 12px;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
  }
`;

export const RegisterButton = styled.button`
  font-size: 1.1rem;
  color: #ffffff;
  background-color: var(--primary);
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--primary-hover);
  }
`;

export const LoginButton = styled.button`
  font-size: 1.1rem;
  color: #ffffff;
  background-color: var(--primary);
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--primary-hover);
  }
`;

export const FeedBack = styled.div`
  width: 100%;
  padding: 12px;
  font-size: 0.95rem;
  color: var(--primary);
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  text-align: center;
`;
