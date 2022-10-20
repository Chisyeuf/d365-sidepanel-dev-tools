import { CssBaseline } from '@material-ui/core'
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'
import React from 'react'

function App() {
    return (
        <ThemeProvider
            theme={createMuiTheme({ typography: { fontFamily: '"Poppins", sans-serif' } })}
        >
            <CssBaseline/>
            <div>
                Hello World!
            </div>
        </ThemeProvider>
    )
}

export default App
