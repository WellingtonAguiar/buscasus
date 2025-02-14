import { FormEvent, useEffect, useState, useRef } from 'react';
import axios from 'axios';

import { MenuBackground } from '../../../components/Menu';
import { MenuLinksAdmin } from '../../../components/MenuLinks/MenuLinksAdmin';
import { Modal } from '../../../components/Modal';
import { Input, sizes } from '../../../components/Form/Input';
import { Button } from '../../../components/Button';
import { Label } from '../../../components/Form/Label';
import { ToastContainer, toast } from 'react-toastify';
import { HoverCard } from '../../../components/HoverCard';

import { CopyToClipboard } from "react-copy-to-clipboard";
import { MagnifyingGlass, LockOpen } from 'phosphor-react';
import 'react-toastify/dist/ReactToastify.css';

import * as C from './styles';

export function Admin() {
    const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
    const [repeatedAdminVerification, setRepeatedAdminVerification] = useState<any>();

    const [adminUsers, setAdminUsers] = useState([]);
    const [adminUserId, setAdminUserId] = useState<number>();
    const [hospital, setHospital] = useState([]);
    const [searchAdmin, setSearchAdmin] = useState<string>();

    const [loginInputValue, setLoginInputValue] = useState<any>();
    const [emailHospital, setEmailHospital] = useState<any>();
    const [passwordInputValue, setPasswordInputValue] = useState<any>();
    const [hospitalInputValue, setHospitalInputValue] = useState<any>();
    const [isLoginInputWithError, setIsLoginInputWithError] = useState<boolean>();
    const [isPasswordInputWithError, setIsPasswordInputWithError] = useState<boolean>();
    const [isHospitalInputWithError, setIsHospitalInputWithError] = useState<boolean>();

    const [hospitalMessageError, setHospitalMessageError] = useState<string>();
    const [isPasswordCopied, setIsPasswordCopied] = useState<boolean>(false);

    const formRef = useRef<any>();

    useEffect(() => {
        axios.get('http://localhost/buscasus/api/area-admin/admin/').then(response => setAdminUsers(response.data));
        axios.get('http://localhost/buscasus/api/area-admin/hospital/').then(response => setHospital(response.data));
    }, []);

    useEffect(() => {
        if (searchAdmin) {
            axios.get('http://localhost/buscasus/api/area-admin/admin/', {
                params: {
                    search: searchAdmin
                }
            }).then(response => setAdminUsers(response.data));
        } else {
            axios.get('http://localhost/buscasus/api/area-admin/admin/').then(response => setAdminUsers(response.data));
        }

        setLoginInputValue(null);
        setEmailHospital(null);
        setRepeatedAdminVerification(null);
        setPasswordInputValue(null);
        setHospitalInputValue(null);

        setIsFormSubmitted(false);

        formRef.current.reset();
    }, [isFormSubmitted]);

    useEffect(() => {
        axios.get('http://localhost/buscasus/api/area-admin/admin/', {
            params: {
                search: searchAdmin,
            }
        }).then(response => setAdminUsers(response.data));
    }, [searchAdmin]);

    useEffect(() => {
        setIsLoginInputWithError(false);
        setIsPasswordInputWithError(false);
    }, [hospitalInputValue]);

    useEffect(() => {
        if (emailHospital) setLoginInputValue(`admin${emailHospital}`);
    }, [emailHospital]);

    async function insertUser(event: FormEvent) {
        event.preventDefault();

        if (!loginInputValue) setIsLoginInputWithError(true);
        if (!passwordInputValue) setIsPasswordInputWithError(true);

        if (hospitalInputValue == 0 || !hospitalInputValue) {
            setIsHospitalInputWithError(true);
            setHospitalMessageError("Selecione um hospital.");
        } else if (repeatedAdminVerification > 0) {
            setIsHospitalInputWithError(true);
            setHospitalMessageError("Esse hospital já possui um administrador.");
        }

        const formData = new FormData(event.target as HTMLFormElement);
        formData.append("loginAdmin", loginInputValue);
        formData.append("senhaAdmin", passwordInputValue);
        formData.append("idHospital", hospitalInputValue);

        if (loginInputValue && passwordInputValue && hospitalInputValue > 0 && repeatedAdminVerification == 0) {
            await axios.post('http://localhost/buscasus/api/area-admin/admin/', formData);

            setIsFormSubmitted(true);
            toast.success("Administrador cadastrado com sucesso!");
        }
    }

    async function deleteUser() {
        await axios.delete('http://localhost/buscasus/api/area-admin/admin/', {
            params: {
                idAdmin: adminUserId
            }
        });

        setIsFormSubmitted(true);
        toast.success("Administrador excluído com sucesso!");
    }

    async function generateUser(id: any) {
        await axios.get('http://localhost/buscasus/api/area-admin/admin/', {
            params: {
                userLogin: true,
                idHospital: id
            }
        }).then(response => setEmailHospital((response.data.emailHospital).split('@')[0]));
    }

    function generatePassword() {
        let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJLMNOPQRSTUVWXYZ@#+";
        let passwordLength = 8;
        let password = "";

        for (let i = 0; i < passwordLength; i++) {
            let randomNumber = Math.floor(Math.random() * chars.length);
            password += chars.substring(randomNumber, randomNumber + 1);
        }
        setPasswordInputValue(password);
    }

    async function verifyIsAdminRepeated(id: any) {
        await axios.get('http://localhost/buscasus/api/area-admin/admin/', {
            params: {
                repeatedAdmin: true,
                idHospital: id
            }
        }).then(response => setRepeatedAdminVerification(response.data.idAdmin));
    }

    return (
        <MenuBackground menuLinks={<MenuLinksAdmin />}>

            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <C.InsertContainer>
                <C.FormContainer>
                    <C.Title>Cadastrar novo administrador de um hospital</C.Title>
                    <form ref={formRef} onSubmit={insertUser} autoComplete="off">
                        <div>
                            <C.InputsContainer>
                                <Label htmlFor="idHospital">
                                    Hospital
                                    <C.Select
                                        onChange={(e) => [
                                            setHospitalInputValue(e.target.value), setIsHospitalInputWithError(false),
                                            verifyIsAdminRepeated(e.target.value), generateUser(e.target.value), generatePassword()
                                        ]}
                                        errorText={isHospitalInputWithError}
                                    >
                                        <option value="0">Selecione</option>
                                        {hospital.map((hosp: any) =>
                                            <option
                                                key={hosp.idHospital}
                                                value={hosp.idHospital}
                                            >
                                                {hosp.nomeHospital}
                                            </option>
                                        )}
                                    </C.Select>
                                    <C.ErrorMsg errorText={isHospitalInputWithError}>{hospitalMessageError}</C.ErrorMsg>
                                </Label>
                                <Label htmlFor="loginAdmin">
                                    Nome de usuário
                                    <Input.Input
                                        isWithIcon={false}
                                        errorText={isLoginInputWithError}
                                        inputSize={sizes.md}
                                        type="text"
                                        id="loginAdmin"
                                        value={loginInputValue}
                                        disabled
                                    />
                                </Label>
                                <Label htmlFor="senhaAdmin">
                                    Senha
                                    <C.PasswordContainer>
                                        <Input.Root>
                                            <Input.Input
                                                isWithIcon={false}
                                                errorText={isPasswordInputWithError}
                                                inputSize={sizes.sm}
                                                type="password"
                                                id="senhaAdmin"
                                                value={passwordInputValue}
                                                disabled
                                            />
                                        </Input.Root>
                                    </C.PasswordContainer>
                                </Label>
                            </C.InputsContainer>
                            <C.ButtonContainer>
                                <Button.Gray
                                    onClick={() => [
                                        setLoginInputValue(null), setEmailHospital(null), setRepeatedAdminVerification(null), setPasswordInputValue(null), setHospitalInputValue(null),
                                        setIsLoginInputWithError(false), setIsPasswordInputWithError(false), setIsHospitalInputWithError(false)
                                    ]}
                                    value="Cancelar"
                                    type="reset"
                                />
                                <Button.Green value="Salvar" type="submit" />
                            </C.ButtonContainer>
                        </div>
                    </form>
                </C.FormContainer>
            </C.InsertContainer>

            <C.TableContainer>
                <C.TableContainerHeader>
                    <h3>Administradores cadastrados</h3>
                    <C.InputsContainer>
                        <Input.Root>
                            <Input.Input
                                onChange={(e) => setSearchAdmin(e.target.value)}
                                isWithIcon
                                errorText={false}
                                inputSize={sizes.lg}
                                id="adminSearch"
                                type="search"
                                placeholder="Buscar"
                            />
                            <Input.LeftIcon
                                htmlFor="adminSearch"
                                topPosition={4}
                                leftPosition={5}
                            >
                                <MagnifyingGlass size={16} />
                            </Input.LeftIcon>
                        </Input.Root>
                    </C.InputsContainer>
                </C.TableContainerHeader>

                <C.Table>
                    <C.Thead>
                        <C.Tr>
                            <C.Th>Nome de usuário</C.Th>
                            <C.Th>Nome do hospital</C.Th>
                            <C.Th></C.Th>
                        </C.Tr>
                    </C.Thead>
                    <C.Tbody>
                        {adminUsers.map((user: any, key) =>
                            <C.InnerTr key={key}>
                                <C.Td>{user.loginAdmin}</C.Td>
                                <C.Td>{user.nomeHospital}</C.Td>
                                <C.Td>
                                    <C.ButtonContainer>
                                        <C.HoverCardContainer>
                                            {user.primeiroAcesso == 0
                                                ?
                                                <C.NotHover size={35} />
                                                :
                                                <HoverCard.Root>
                                                    <HoverCard.Trigger>
                                                        <LockOpen size={35} />
                                                    </HoverCard.Trigger>
                                                    <HoverCard.Content>
                                                        <CopyToClipboard
                                                            text={user.senhaAdmin}
                                                            onCopy={() => setIsPasswordCopied(true)}
                                                        >
                                                            <C.ClipboardText>{user.senhaAdmin}</C.ClipboardText>
                                                        </CopyToClipboard>
                                                        {isPasswordCopied ? <C.ClipboardAlert>Copiado!</C.ClipboardAlert> : null}
                                                    </HoverCard.Content>
                                                </HoverCard.Root>
                                            }
                                        </C.HoverCardContainer>
                                        <Modal.Alert
                                            itemId={() => { setAdminUserId(user.idAdmin) }}
                                            closeModal={() => { setAdminUserId(0) }}
                                            title="Excluir administrador"
                                            modalAction={deleteUser}
                                            cancel='Cancelar'
                                            submit='Excluir'
                                        >
                                            Deseja excluir o administrador selecionado?
                                        </Modal.Alert>
                                    </C.ButtonContainer>
                                </C.Td>
                            </C.InnerTr>
                        )}
                    </C.Tbody>
                </C.Table>
            </C.TableContainer>
        </MenuBackground >
    )
}