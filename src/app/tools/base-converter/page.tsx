"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

function formatBinary(bin: string) {
  return bin.replace(/(.{4})/g, "$1 ").trim();
}

function parseInput(value: string, base: number): number | null {
  try {
    return parseInt(value.replace(/\s+/g, ""), base);
  } catch {
    return null;
  }
}

export default function BaseConverter() {
  const [fromBase, setFromBase] = useState(10);
  const [toBase, setToBase] = useState(2);
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");

  useEffect(() => {
    handleFromValueChange(fromValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromBase, toBase]);

  const handleFromValueChange = (value: string) => {
    setFromValue(value);
    const num = parseInput(value, fromBase);
    if (num === null || isNaN(num)) {
      setToValue("");
      return;
    }
    let converted = num.toString(toBase);
    if (toBase === 2) {
      converted = formatBinary(converted);
    }
    setToValue(converted);
  };

  const handleToValueChange = (value: string) => {
    setToValue(value);
    const num = parseInput(value, toBase);
    if (num === null || isNaN(num)) {
      setFromValue("");
      return;
    }
    setFromValue(num.toString(fromBase));
  };

  const renderBaseOptions = () =>
    Array.from({ length: 35 }, (_, i) => i + 2).map((b) => (
      <SelectItem key={b} value={b.toString()}>
        {b} 进制
      </SelectItem>
    ));

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">进制转换工具</h1>

      <Card className="mb-6">
        <CardContent className="p-4 space-y-4 text-2xl">
          <div className="flex items-center gap-4">
            <Select value={fromBase.toString()} onValueChange={(val) => setFromBase(parseInt(val))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{renderBaseOptions()}</SelectContent>
            </Select>
          </div>
          <Input
            placeholder="请输入数字"
            value={fromValue}
            className="text-4xl"
            onChange={(e) => handleFromValueChange(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <Select value={toBase.toString()} onValueChange={(val) => setToBase(parseInt(val))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{renderBaseOptions()}</SelectContent>
            </Select>
          </div>
          <Input
            placeholder="转换结果"
            value={toValue}
            className="text-2xl"
            onChange={(e) => handleToValueChange(e.target.value)}
          />
        </CardContent>
      </Card>
    </main>
  );
}
