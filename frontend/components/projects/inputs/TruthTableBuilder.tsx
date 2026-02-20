"use client"

// ============================================================================
// TRUTH TABLE BUILDER
// Interactive truth table with input/output columns
// ============================================================================

import { cn } from "@/lib/utils"
import type { TruthTableConfig } from "@/lib/project-schema"

interface TruthTableBuilderProps {
    config: TruthTableConfig
    value?: Record<string, boolean[]>
    onChange: (value: Record<string, boolean[]>) => void
    themeColor?: string
}

export function TruthTableBuilder({
    config,
    value = {},
    onChange,
    themeColor = "#8B7CFF"
}: TruthTableBuilderProps) {
    // Ensure value is never null
    const safeValue = value || {}

    // Generate input combinations (binary counting)
    const generateInputRows = () => {
        const rows: boolean[][] = []
        for (let i = 0; i < config.rows; i++) {
            const row: boolean[] = []
            for (let j = config.inputColumns.length - 1; j >= 0; j--) {
                row.unshift((i >> (config.inputColumns.length - 1 - j) & 1) === 1)
            }
            rows.push(row)
        }
        return rows
    }

    const inputRows = generateInputRows()

    // Handle output cell toggle
    const handleToggle = (column: string, rowIndex: number) => {
        const currentColumn = safeValue[column] || Array(config.rows).fill(false)
        const newColumn = [...currentColumn]
        newColumn[rowIndex] = !newColumn[rowIndex]

        onChange({
            ...safeValue,
            [column]: newColumn,
        })
    }

    // Get output value for a cell
    const getOutputValue = (column: string, rowIndex: number): boolean | null => {
        const columnData = safeValue[column]
        if (!columnData || columnData[rowIndex] === undefined) return null
        return columnData[rowIndex]
    }

    // Check if a cell is correct (if correctValues are provided)
    const isCellCorrect = (column: string, rowIndex: number): boolean | null => {
        const correctValues = config.correctValues?.[column]
        if (!correctValues) return null

        const userValue = getOutputValue(column, rowIndex)
        if (userValue === null) return null

        return userValue === correctValues[rowIndex]
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Click output cells to toggle between 0 and 1:
            </p>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            {/* Input column headers */}
                            {config.inputColumns.map(col => (
                                <th
                                    key={col}
                                    className="px-4 py-2 text-center font-semibold text-sm border border-border/30 bg-muted/30"
                                >
                                    {col}
                                </th>
                            ))}

                            {/* Separator */}
                            <th className="w-2 bg-border/20" />

                            {/* Output column headers */}
                            {config.outputColumns.map(col => (
                                <th
                                    key={col}
                                    className="px-4 py-2 text-center font-semibold text-sm border border-border/30"
                                    style={{
                                        backgroundColor: `${themeColor}20`,
                                        color: themeColor
                                    }}
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {inputRows.map((inputRow, rowIndex) => (
                            <tr key={rowIndex}>
                                {/* Input cells (read-only) */}
                                {inputRow.map((val, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="px-4 py-3 text-center font-mono text-sm border border-border/30 bg-muted/10"
                                    >
                                        {val ? "1" : "0"}
                                    </td>
                                ))}

                                {/* Separator */}
                                <td className="w-2 bg-border/20" />

                                {/* Output cells (editable) */}
                                {config.outputColumns.map(col => {
                                    const outputValue = getOutputValue(col, rowIndex)
                                    const isCorrect = isCellCorrect(col, rowIndex)

                                    return (
                                        <td
                                            key={col}
                                            className="p-1 border border-border/30"
                                        >
                                            <button
                                                onClick={() => handleToggle(col, rowIndex)}
                                                className={cn(
                                                    "w-full py-2 rounded font-mono text-sm font-bold transition-all duration-200",
                                                    outputValue === null && "bg-muted/20 text-muted-foreground hover:bg-muted/40",
                                                    outputValue !== null && isCorrect === true && "bg-green-500/20 text-green-400",
                                                    outputValue !== null && isCorrect === false && "bg-red-500/20 text-red-400",
                                                    outputValue !== null && isCorrect === null && "text-foreground"
                                                )}
                                                style={outputValue !== null && isCorrect === null ? {
                                                    backgroundColor: `${themeColor}20`,
                                                } : undefined}
                                            >
                                                {outputValue === null ? "?" : outputValue ? "1" : "0"}
                                            </button>
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: `${themeColor}20` }}
                    />
                    <span>Your answer</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500/20" />
                    <span>Correct</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500/20" />
                    <span>Incorrect</span>
                </div>
            </div>

            {/* Progress */}
            <p className="text-xs text-muted-foreground">
                Cells filled: {Object.values(safeValue).flat().filter(v => v !== undefined && v !== null).length} / {config.outputColumns.length * config.rows}
            </p>
        </div>
    )
}
