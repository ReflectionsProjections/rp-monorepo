import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Box } from "@chakra-ui/react"
import Navbar from "@app/sections/admin/components/Navbar"
import type { Role } from "@app"
import { api } from "@app"
import Unauthorized from "@app/sections/admin/components/Unauthorized"
import Login from "@app/sections/admin/components/Login"
import {
    ColorThemeProvider,
    useColorTheme,
} from "@app/sections/admin/contexts/ColorThemeContext"

export type MainContext = {
    displayName: string
    roles: Role[]
    authorized: boolean
}

const MainContent = () => {
    const [displayName, setDisplayName] = useState<string>("")
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const { currentProfile } = useColorTheme()
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if (!localStorage.getItem("jwt")) {
            setLoading(false)
            return
        }

        api.get("/auth/info")
            .then((response) => {
                if (
                    location.pathname !== "/admin/unauthorized" &&
                    !response.data.roles.includes("ADMIN")
                ) {
                    void navigate("/admin/unauthorized", { replace: true })
                }

                setDisplayName(response.data.displayName)
                setRoles(response.data.roles)
                setLoading(false)
            })
            .catch(() => {})
    }, [location.pathname, navigate])

    useEffect(() => {
        if (loading || !localStorage.getItem("jwt")) {
            return
        }

        if (
            location.pathname === "/admin/unauthorized" &&
            roles.includes("STAFF")
        ) {
            void navigate("/admin", { replace: true })
            return
        }

        if (
            !roles.includes("STAFF") &&
            location.pathname !== "/admin/unauthorized"
        ) {
            void navigate("/admin/unauthorized", { replace: true })
        }
    }, [loading, location.pathname, navigate, roles])

    const authenticated = !!localStorage.getItem("jwt")
    const authorized = !loading && roles.includes("STAFF")

    const context = {
        displayName,
        roles,
        authorized,
    } satisfies MainContext

    return (
        <Box
            minH="100vh"
            display="flex"
            flexDir={{ base: "column", md: "row" }}
            bgGradient={currentProfile.gradient}
        >
            <Navbar roles={roles} loading={loading} displayName={displayName} />
            <Box
                mt={{ base: "100px", md: "0" }}
                ml={{ base: "0", md: "max(12vw, 300px)" }}
                px={{ base: 2, md: 8 }}
                py={8}
                w="100%"
                filter={!authorized ? "blur(16px)" : "none"}
                pointerEvents={!authorized ? "none" : "auto"}
                transition="filter 0.5s"
                overflow={!authorized ? "hidden" : "auto"}
                maxH={
                    !authorized
                        ? { base: "calc(100vh - 100px)", md: "100vh" }
                        : undefined
                }
            >
                <Outlet context={context} />
            </Box>
            {!loading && (!authenticated || !authorized) && (
                <Box
                    position="fixed"
                    top={{ base: "100px", md: "0" }}
                    left={{ base: "0", md: "max(12vw, 300px)" }}
                    w={{ base: "100%", md: "calc(100% - max(12vw, 300px))" }}
                    h={{ base: "calc(100% - 100px)", md: "100%" }}
                    zIndex={10}
                >
                    {authenticated ? (
                        !authorized && <Unauthorized />
                    ) : (
                        <Login />
                    )}
                </Box>
            )}
        </Box>
    )
}

const Main = () => {
    return (
        <ColorThemeProvider>
            <MainContent />
        </ColorThemeProvider>
    )
}

export default Main
